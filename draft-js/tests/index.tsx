/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { getSessionStorageContainer } from "@fluidframework/get-session-storage-container";
import { getDefaultObjectFromContainer } from "@fluidframework/aqueduct";

import React from "react";
import ReactDOM from "react-dom";

import { FluidDraftJsContainer, FluidDraftJsObject, FluidDraftJsView } from "../src";

import { FluidContext } from "../src/utils";

// Since this is a single page fluid application we are generating a new document id
// if one was not provided
let createNew = false;
if (window.location.hash.length === 0) {
    createNew = true;
    window.location.hash = Date.now().toString();
}
const documentId = window.location.hash.substring(1);

/**
 * This is a helper function for loading the page. It's required because getting the Fluid Container
 * requires making async calls.
 */
async function createContainerAndRenderInElement(element: HTMLElement, createNewFlag: boolean) {
    // The SessionStorage Container is an in-memory Fluid container that uses the local browser SessionStorage
    // to store ops.
    const container = await getSessionStorageContainer(documentId, FluidDraftJsContainer, createNewFlag);

    // Get the Default Object from the Container
    const defaultObject = await getDefaultObjectFromContainer<FluidDraftJsObject>(container);

    // Render the content using ReactDOM
    ReactDOM.render(
        <FluidContext.Provider value={defaultObject}>
            <FluidDraftJsView />
        </FluidContext.Provider>,
        element,
    );

    // Setting "fluidStarted" is just for our test automation
    // eslint-disable-next-line dot-notation
    window["fluidStarted"] = true;
}

/**
 * For local testing we have two div's that we are rendering into independently.
 */
async function setup() {
    const leftElement = document.getElementById("sbs-left");
    if (leftElement === null) {
        throw new Error("sbs-left does not exist");
    }
    await createContainerAndRenderInElement(leftElement, createNew);
    const rightElement = document.getElementById("sbs-right");
    if (rightElement === null) {
        throw new Error("sbs-right does not exist");
    }
    // The second time we don't need to createNew because we know a Container exists.
    await createContainerAndRenderInElement(rightElement, false);
}

setup().catch((e) => {
    console.error(e);
    console.log("%cThere were issues setting up and starting the in memory FLuid Server", "font-size:30px");
});
