import React from 'react'

let Actions = {
    push: () => {},
    pop: () => {},
}

const updateAction = (actionName, action) => {
    Actions[actionName] = action;
}



export default Actions;
export {updateAction}