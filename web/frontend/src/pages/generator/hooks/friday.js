import { useSignal } from "@preact/signals-react";
import { useLayoutEffect } from "react";

const useFriday = () => {
    const core = useSignal("");
    const sections = useSignal([""]);
    const loading = useSignal(false);
    const steps = useSignal([]);



    const generate = () => {
        if (loading.value) return
        steps.value = []
        loading.value = true
        fetch('http://localhost:3000/gen', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sections: sections.value,
                core: core.value
            })
        })
            .then((response) => {
                const reader = response.body.getReader();

                function read() {
                    return reader.read().then(({ done, value }) => {
                        if (done) {
                            console.log('Stream completed.');
                            return;
                        }

                        const chunk = new TextDecoder().decode(value);
                        console.log("log", value, chunk);
                        const data = JSON.parse(chunk)
                        steps.value = [...steps.value, data]
                        console.log('Received chunk:', data);
                        return read(); // Read next chunk recursively
                    });
                }

                return read();
            })
            .finally(() => {
                loading.value = false;
            })
            .catch((error) => {
                console.error('Error occurred:', error);
            });

    }
    const setCore = (prompt) => {
        core.value = prompt;
        localStorage.setItem("friday_core", prompt);
    }
    const setSections = (_sections) => {
        sections.value = [..._sections];
        // cache
        localStorage.setItem("friday_sections", JSON.stringify(_sections));
    }
    useLayoutEffect(() => {
        // load from cache
        const _core = localStorage.getItem("friday_core") || "";
        const _sections = JSON.parse(localStorage.getItem("friday_sections") || "[]");
        setCore(_core);
        if (_sections.length) {
            setSections(_sections)
        }
    }, [])
    return {
        core,
        sections,
        generate,
        loading,
        steps,
        setCore,
        setSections
    }
}
export default useFriday;