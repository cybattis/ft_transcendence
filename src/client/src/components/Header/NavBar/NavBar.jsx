import { Link } from 'react-router-dom'
import './navbar.css'

export default function Header() {
    return (
        <nav>
            <div className='div-NavBar'>
                <div>
                    <Link to="/" className='div-link'>Home</Link>
                </div>
                <div>
                    <Link to="/about" className='div-link'>About</Link>
                </div>
                <div>
                    <Link to="/team" className='div-link'>Team</Link>
                </div>
            </div>
        </nav>
    );
}