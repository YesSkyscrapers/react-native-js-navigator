import React from 'react'
import { View, StyleSheet } from 'react-native'

export default class Scene extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            content: null
        }
    }

    componentDidMount() {
        const { component, ...props } = this.props;
        this.setState({
            content: React.createElement(component, props)
        })
    }

    push = () => {
        return false
    }

    pop = () => {
        return false
    }

    render() {
        return (
            <View style={styles.sceneContainer}>
                {
                    this.state.content ? React.cloneElement(this.state.content, this.props) : null
                }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    sceneContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: 'white'
    }
})
