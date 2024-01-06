import React, { Component, ErrorInfo, ReactNode } from "react";

import Navbar from "./components/Navbar";
import "./css/styles.css";
import AnimatedCursor from "react-animated-cursor";
import { Signature } from "./components/Signature";
import Slider from "./components/Slider";
import { fragment, vertex } from "./components/shaders/distortionShader";

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = {
        hasError: false,
    };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Error:", error);
        console.error("Error Info:", errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return <div className="errorText">Something went wrong.</div>;
        }

        return this.props.children;
    }
}

const App: React.FC = () => {
    const slides = [
        {
            imgSrc: "./images/image-1.jpg",
            divClass: "grid__item",
            fragmentShader: fragment,
            vertexShader: vertex,
        },
        {
            imgSrc: "./images/LP-front.jpg",
            canvasClass: "warp-canvas",
        },
        {
            imgSrc: "./images/image-3-black-bg.jpg",
            divClass: "grid__item",
            fragmentShader: fragment,
            vertexShader: vertex,
        }
    ]
    return (
        <ErrorBoundary>
            <>
                <AnimatedCursor
                    innerSize={8}
                    outerSize={36}
                    color="255, 255, 255"
                    outerAlpha={0.1}
                    innerScale={0.5}
                    outerScale={3}
                    clickables={["a", "button", "nav-link"]}
                />
                <Navbar />
                <Signature
                    imgSrc="./images/EDCSignature.png"
                    title="ERIKA de CASIER"
                />
                <Slider slides={slides}/>
            </>
        </ErrorBoundary>
    );
};

export default App;
