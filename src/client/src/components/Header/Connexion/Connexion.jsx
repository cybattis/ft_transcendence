import React from 'react';
import { Link } from 'react-router-dom'
import '../header.css'
import './connexion.css'
import logo from './signup.png'


export default function Connexion() {
    return (
        <nav>
            <div className='div-NavBar'>
                <div>
                    <Link to="/login" className='div-link'>Login</Link>
                </div>
                <div className="div-signin">
                    <Link to="/signup" className='div-signup'><button className='div-signup-button'><img class='div-logo-link' src={logo}/>SignUp</button></Link>
                </div>
            </div>
        </nav>
    );
}