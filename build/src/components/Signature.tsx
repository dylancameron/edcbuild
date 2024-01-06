import React from "react";
import "../css/styles.css";

interface Props {
    imgSrc?: string;
    title?: string;
    sectionId?: string;
}

export class Signature extends React.Component<Props, {}> {
    render() {
        const { imgSrc, title, sectionId } = this.props;

        return (
            <>
                <section id={sectionId} className="section__full-page">
                    <div className="hero__wrapper">
                        <div className="hero__contents">
                            <div className="hero__hero-text">{title}</div>
                            <img className="signature" src={imgSrc} />
                        </div>
                    </div>
                </section>
            </>
        );
    }
}
