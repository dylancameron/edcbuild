import React from "react";
import "../css/styles.css";

class Navbar extends React.Component {
    render() {
        return (
            <>
                <nav className="nav__wrapper">
                    <div className="nav__content">
                        <div className="nav__link-container">
                            <a className="nav__link" href="#">
                                ERIKA de CASIER
                            </a>
                        </div>

                        <div className="nav__link-container column align-end">
                            <a title="Listen" className="nav__link" href="#">
                                LISTEN
                            </a>
                            <a
                                title="Tour Dates"
                                className="nav__link"
                                href="#"
                            >
                                TOUR DATES
                            </a>
                        </div>
                    </div>
                </nav>
            </>
        );
    }
}

export default Navbar;
