import { Link } from 'react-router-dom';

export default function Login() {
    return (
        <div>
            <a
            className="Api42-link"
            href="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-edf712168eec4256ee4f78ca683cdc411e0d71b7cafcff73b1876feb3f229d47&redirect_uri=http%3A%2F%2F127.0.0.1%3A3000%2F&response_type=code
            "
            target="_blank"
            rel="noopener noreferrer"
            >
                Login
            </a>
            <nav>
                <Link to='/CreateAccount'>Create Account</Link>
            </nav>
        </div>
    );
}