// Filename - "./components/Navbar.js

import React from "react";
import { Nav, NavLink, NavMenu } from "./NavbarElements";

const Navbar = () => {
    return (
        <>
            <Nav>
                <NavMenu>
                    <NavLink to="/overview" activeStyle>
                        Overview
                    </NavLink>
                </NavMenu>
            </Nav>
        </>
    );
};

export default Navbar;
