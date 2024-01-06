import React, { useState } from "react";
import "../css/styles.css"
import DistortCanvas from "./DistortCanvas.tsx";
import WarpedCanvas from "./WarpedCanvas.tsx";
import { vertex, fragment } from "./shaders/distortionShader.tsx";

interface Slide {
    imgSrc: string;
    divClass?: string;
    fragmentShader?: string;
    vertexShader?: string;
    canvasClass?: string;
}

interface SliderProps {
    slides: Slide[];
}

const Slider: React.FC<SliderProps> = ({ slides }) => {
    const [currentIndex, setCurrentIndex] = useState<number>(0);

    const handleNext = () => {
        console.log("Next button clicked");
        setCurrentIndex((prevIndex) => (prevIndex + 1) % 3);
    };

    const handlePrev = () => {
        console.log("Previous button clicked");
        setCurrentIndex((prevIndex) => (prevIndex - 1 + 3) % 3);
    };

    return (
        <div className="slider-container">
            <div className="slider-button-wrapper">
                <button
                    className="slider-button prev-button"
                    onClick={handlePrev}
                    data-cursor-sticky
                >
                    <svg
                        className="icon left"
                        xmlns="http://www.w3.org/2000/svg"
                        height="16"
                        width="14"
                        viewBox="0 0 448 512"
                    >
                        <path d="M437.5 261.8l6-5.8-6-5.8-184-176-5.8-5.5L236.7 80.3l5.8 5.5L412.1 248 8 248l-8 0 0 16 8 0 404.1 0L242.5 426.2l-5.8 5.5 11.1 11.6 5.8-5.5 184-176z" />
                    </svg>
                </button>
                <button
                    className="slider-button next-button"
                    onClick={handleNext}
                    data-cursor-sticky
                >
                    <svg
                        className="icon"
                        xmlns="http://www.w3.org/2000/svg"
                        height="16"
                        width="14"
                        viewBox="0 0 448 512"
                    >
                        <path d="M437.5 261.8l6-5.8-6-5.8-184-176-5.8-5.5L236.7 80.3l5.8 5.5L412.1 248 8 248l-8 0 0 16 8 0 404.1 0L242.5 426.2l-5.8 5.5 11.1 11.6 5.8-5.5 184-176z" />
                    </svg>
                </button>
            </div>

            <div
                className="slider-content"
                style={{ transform: `translateX(${-currentIndex * 100}%)` }}
            >
                {slides.map((slide, index) => (
                    <div key={index} className="slider-item">
                        {slide.canvasClass ? ( // Check if canvasClass property exists
                            <WarpedCanvas
                                imgSrc={slide.imgSrc}
                                canvasClass={slide.canvasClass}
                            />
                        ) : (
                            <DistortCanvas
                                imgSrc={slide.imgSrc}
                                divClass={slide.divClass || "grid__item"}
                                fragmentShader={slide.fragmentShader || fragment}
                                vertexShader={slide.vertexShader || vertex}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Slider;
