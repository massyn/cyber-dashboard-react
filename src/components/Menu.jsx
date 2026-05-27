import React from "react";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

const NAVBAR_BG = "#0d2137";

const Menu = () => {
    return (
        <Navbar data-bs-theme="dark" sticky="top" style={{ backgroundColor: NAVBAR_BG }}>
            <Container>
                <Navbar.Brand href="/">Cyber Metrics</Navbar.Brand>
                <Navbar.Toggle aria-controls="main-nav" />
                <Navbar.Collapse id="main-nav">
                    <Nav className="me-auto">
                        <Nav.Link href="/">Overview</Nav.Link>
                        <Nav.Link href="/metrics">Metrics</Nav.Link>
                    </Nav>
                    <Nav className="ms-auto">
                        <Nav.Link href="https://github.com/massyn/cyber-dashboard-react" target="_blank" rel="noopener noreferrer">Github</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Menu;
