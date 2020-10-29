import React from 'react'
import Scene from '../components/Scene'
import Tab from '../components/Tab'
import Stack from '../components/Stack'



const getType = (name) => {
    const mapping = {
        [Scene.name]: Scene,
        [Tab.name]: Tab,
        [Stack.name]: Stack,
    }
    const result = mapping[name]

    if (result) {
        return result
    } else {
        throw new Error(`Unknown mapping type - ${name}`)
    }
}

export default {
    getType
}
