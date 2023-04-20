import NavBar from './NavBar/NavBar';
import Logo from '../Logo/Logo'
import Connexion  from './Connexion/Connexion'
import './header.css'

export default function Header() {
    return (
        <nav>
            <div className='div-Header'>
                <div className='div-Left'>
                    <Logo />
                    <NavBar />
                </div>
                <div className='div-Right'>
                    <Connexion />
                </div>
            </div>
        </nav>
    );
}