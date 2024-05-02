"use client"
import { createContext, useContext } from "react";
import { observable, configure } from "mobx";
import pixeModel from "@/pixeModel";
import connectToFirebase from "@/firebaseModel"

configure({ enforceActions: "never", });
const reactiveModel = observable(pixeModel);
const ModelContext = createContext(null);

export function ModelProvider({ children })  {
  
    return (
        <ModelContext.Provider value={reactiveModel}>
          {children}
        </ModelContext.Provider>
    );

}

export const useModel = () => useContext(ModelContext);
connectToFirebase(reactiveModel);
console.log(reactiveModel);