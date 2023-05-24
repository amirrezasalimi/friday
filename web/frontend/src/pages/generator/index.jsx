import { Button, Spinner, Textarea } from "@nextui-org/react"
import "./style.css"
import useFriday from "./hooks/friday"
import { GrClose } from "react-icons/gr"
export const GeneratorPage = () => {
    const friday = useFriday();
    const addSection = () => {
        friday.setSections([...friday.sections.value, ""])

        setTimeout(() => {
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: "smooth"
            })
        }, 100)
    }

    const removeSection = (i) => {
        console.log([...friday.sections.value.filter((_, _i) => _i !== i)]);
        const newValues = [...friday.sections.value.filter((_, _i) => _i !== i)]
        friday.setSections(newValues)

    }
    const changeSection = (i, value) => {
        const newValues = [...friday.sections.value]
        newValues[i] = value;
        friday.setSections(newValues)
    }
    const steps = friday.steps.value;
    return <>
        <div className="container mx-auto mt-4 pb-8">
            <h2>
                Friday | Developer Agent (NodeJs)
            </h2>

            <div className="flex justify-between items-stretch">
                <div className="flex flex-col mt-4 w-5/6">
                    <div className="flex flex-col  border-l-4
                   min-h-[300px] border-cyan-300
                pl-3
                ">
                        <div>
                            <h3>
                                Context
                            </h3>
                        </div>
                        <Textarea value={friday.core.value}
                            onChange={(e) => {
                                friday.setCore(e.target.value);
                            }}
                            minRows={12}
                            maxRows={12}
                            className="mt-2 h-[100%] full-textarea"
                            placeholder='hello'
                        >

                        </Textarea>
                    </div>

                    {
                        friday.sections.value.map((section, i) => {
                            return <div key={i} className="flex flex-col mt-4 border-l-4
                        min-h-[250px] border-cyan-300
                     pl-3
                     ">
                                <div className="flex justify-between items-center pr-1">
                                    <h3>
                                        Section {i + 1}
                                    </h3>
                                    <GrClose onClick={() => removeSection(i)} className="delete cursor-pointer transition-all hover:scale-110" />
                                </div>
                                <Textarea value={section}
                                    onChange={(e) => changeSection(i, e.target.value)}
                                    minRows={10} maxRows={10} className="mt-2 h-[100%] full-textarea"
                                    placeholder='/hello => say hello'>

                                </Textarea>
                            </div>
                        })
                    }
                    <div className="flex justify-between">
                        <Button variant="solid" onPress={addSection} className="bg-cyan-600 mt-4" color="primary">
                            Add
                        </Button>

                        <Button onPress={friday.generate}
                            variant="shadow"
                            className="mt-4" color="primary">
                            Generate
                        </Button>
                    </div>

                    <div>

                    </div>
                </div>
                <div className=" ml-4 h-auto flex w-4/6">
                    <div className="border-l-4 pl-4 border-cyan-400 w-full flex flex-col">
                        {
                            steps.map((step, i) => {
                                const isLastItem = steps.length - 1 == i;
                                const showLoading = friday.loading.value && isLastItem
                                return <div className="step flex items-center rounded-md mb-2 p-2 px-3 bg-cyan-400 w-[fit-content]" key={i}>
                                    {
                                        showLoading &&
                                        <Spinner size="sm" color="current" />
                                    }
                                    <span className="ml-2">
                                        {step.title} {showLoading ? '...' : "✅"}
                                    </span>
                                </div>
                            })
                        }
                    </div>
                </div>
            </div>
        </div>
    </>
}