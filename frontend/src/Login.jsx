import { useEffect, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css"

function Login() {
    const navigate=useNavigate();
    const [swapped, setSwapped] = useState(false);
    const [showPassLogin, setshowPassLogin] = useState(false);
    const [showPassSignup, setShowPassSignup] = useState(false);
    const [showConPass, setShowConPass] = useState(false);
    const [loginData, setLoginData] = useState({
        userName: "",
        email: "",
        password: ""
    });
    const [signupData, setSignupData] = useState({
        userName: "",
        email: "",
        password: "",
        conformPassword: ""
    });
    const [match, setMatch] = useState(false);
    const [isgamilerror1, setIsgamilerror1] = useState(false);
    const [isgamilerror2, setIsgamilerror2] = useState(false);
    const [degrees, setDegrees] = useState([
        "B.Tech",
        "M.Tech",
        "PhD"
    ]);
    const [branches, setBranches] = useState([
        "Biotechnology",
        "Chemical Engineering",
        "Civil Engineering",
        "Computer Science & Engineering",
        "Electrical Engineering",
        "Electronics & Communication Engineering",
        "Mechanical Engineering",
        "Metallurgical & Materials Engineering",
        "School of Sciences",
        "School of Humanities & Management"
    ]);
    const [degree,setDegree]=useState("B.Tech");
    const [branch,setBranch]=useState("Computer Science & Engineering");
    const [year,setYear]=useState(1);


    useEffect(() => {
        setMatch(
            signupData.password === signupData.conformPassword
        );
    }, [signupData.password, signupData.conformPassword]);

    useEffect(() => {
        const gmailRegex = /^[0-9]{6}@student\.nitandhra\.ac\.in$/;
        setIsgamilerror1(signupData.email !== "" && !gmailRegex.test(signupData.email));
    }, [signupData.email]);

    useEffect(() => {
        const gmailRegex = /^[0-9]{6}@student\.nitandhra\.ac\.in$/;
        setIsgamilerror2(loginData.email !== "" && !gmailRegex.test(loginData.email));
    }, [loginData.email]);

    function swap() {
        setSwapped((prev) => !prev);
    }

    function signup(e) {
        e.preventDefault();
        if (signupData.email === "" || signupData.password === "" || signupData.conformPassword === "" || signupData.userName === "") {
            alert("All fields are required.");
            return;
        }
        const gmailRegex = /^[0-9]{6}@student\.nitandhra\.ac\.in$/;
        if (!gmailRegex.test(signupData.email)) {
            alert("Please enter a valid Gmail address.");
            return;
        }
        if (!match) {
            alert("Both passwords are not matching.");
            return;
        }
        axios.post('http://localhost:5000/signup', {
            userName: signupData.userName,
            email: signupData.email,
            password: signupData.password,
            degree:degree,
            branch:branch,
            year:year
        }).then(response => {
            console.log(response);
            localStorage.setItem("userId", response.data.user._id);
            localStorage.setItem("token",response.data.token);
            navigate('/home');
        })
            .catch(error => {
                alert(error.response.data.message);
            });
    }

    function login(e) {
        e.preventDefault();
        if (loginData.email === "" || loginData.password === "") {
            alert("All fields are required.");
            return;
        }
        const gmailRegex = /^[0-9]{6}@student\.nitandhra\.ac\.in$/;
        if (!gmailRegex.test(loginData.email)) {
            alert("Please enter a valid Gmail address.");
            return;
        }
        axios.post('http://localhost:5000/login', {
            email: loginData.email,
            password: loginData.password
        }).then(response => {
            localStorage.setItem("userId", response.data.user._id);
            localStorage.setItem("token",response.data.token);
            navigate('/home');
        }
        )
            .catch(error => {
                alert(error.response.data);
            });
    }

    return (
        <div className="login-outer-div">
            <div className="login-main-div">
                <div className={swapped ? "left-div swapped" : "left-div"}>
                    <div className="login">
                        <h1>Welcome Back</h1>
                        <p>Continue you process where they left of</p>
                        <p>consistance is the main key to success so work hard</p>
                        <button
                            onClick={swap}
                        >Sign Up</button>
                    </div>
                    <div className="signup">
                        <h1>Welcome to Portify</h1>
                        <p>SignUp and Explore the beatiful world</p>
                        <p>portify is an amazing platform  where you can have your best portifolio</p>
                        <button
                            onClick={swap}
                        >Login</button>
                    </div>
                </div>
                <div className={swapped ? "right-div swapped" : "right-div"}>
                    <form>
                        <div className="login">
                            <h2 className="login-title">Login</h2>

                            <div className="input-group">
                                <input type="text" className="login-email" required
                                    value={loginData.email}
                                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                />
                                <label>Email</label>
                                <p className={isgamilerror2 ? "emailerr show" : "emailerr"}>please enter valid email</p>
                            </div>

                            <div className="input-group">
                                <input type={showPassLogin ? "text" : "password"} className="login-pass" required
                                    value={loginData.password}
                                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                />
                                <span
                                    onClick={() => {
                                        setshowPassLogin(!showPassLogin);
                                    }
                                    }
                                    style={{
                                        position: "absolute",
                                        right: "10px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        cursor: "pointer"
                                    }}
                                >
                                    {showPassLogin ? <FaEye /> : <FaEyeSlash />}
                                </span>
                                <label>Password</label>
                            </div>

                            <button className="login-btn"
                                onClick={(e) => login(e)}
                            >Sign In</button>

                            <p className="sign-up-note">Don't have an account? <span onClick={swap}>sign up...</span></p>
                        </div>
                    </form>
                    <form>
                        <div className="signup">
                            <h2 className="login-title">Sign Up</h2>

                            <div className="input-group">
                                <input type="text" className="signup-username" required
                                    value={signupData.userName}
                                    onChange={(e) => setSignupData({ ...signupData, userName: e.target.value })}
                                />
                                <label>Username</label>
                            </div>

                            <div className="input-group">
                                <input type="text" className="signup-email" required
                                    value={signupData.email}
                                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                                />
                                <label>Email</label>
                                <p className={isgamilerror1 ? "emailerr show" : "emailerr"}>please enter valid email</p>
                            </div>

                            <div className="input-group">
                                <input type={showPassSignup ? "text" : "password"} className="signup-pass" required
                                    value={signupData.password}
                                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                                />
                                <span
                                    onClick={() => {
                                        setShowPassSignup(!showPassSignup);
                                    }}
                                    style={{
                                        position: "absolute",
                                        right: "10px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        cursor: "pointer"
                                    }}
                                >
                                    {showPassSignup ? <FaEye /> : <FaEyeSlash />}
                                </span>
                                <label>Password</label>
                            </div>

                            <div className="input-group">
                                <input type={showConPass ? "text" : "password"} className="signup-con-pass" required
                                    value={signupData.conformPassword}
                                    onChange={(e) => {
                                        setSignupData({ ...signupData, conformPassword: e.target.value })

                                    }}
                                />
                                <span
                                    onClick={() => {
                                        setShowConPass(!showConPass);
                                    }
                                    }
                                    style={{
                                        position: "absolute",
                                        right: "10px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        cursor: "pointer"
                                    }}
                                >
                                    {showConPass ? <FaEye /> : <FaEyeSlash />}
                                </span>
                                <label >Conform Password</label>
                                <p className={match ? "pass-notmatch-note" : "pass-notmatch-note show"}>Both passwords are not matching.</p>
                            </div>
                            <div className="acedamic-details-div">
                                <select className="degree-select"
                                    value={degree}
                                    onChange={(e)=>{
                                        setDegree(e.target.value);
                                    }}
                                >
                                    {
                                        degrees.map((degree,index)=>{

                                            return(
                                                <option key={index} value={degree}>{degree}</option>
                                            )
                                        })
                                    }  
                                </select>
                                <select className="branch-select"
                                value={branch}
                                    onChange={(e)=>{
                                        setBranch(e.target.value);
                                    }}>
                                    {
                                        branches.map((branch,index)=>{
                                            return(
                                                <option>{branch}</option>
                                            )
                                        })
                                    }  
                                </select>
                                {
                                    degree==="B.Tech"
                                    ?<select value={year} className="year-select" onChange={(e)=>{setYear(e.target.value)}}>
                                        <option value={1}>1</option>
                                        <option value={2}>2</option>
                                        <option value={3}>3</option>
                                        <option value={4}>4</option>
                                    </select>:degree==="M.Tech"
                                    ?<select value={year} className="year-select" onChange={(e)=>{setYear(e.target.value)}}>
                                        <option value={1}>1</option>
                                        <option value={2}>2</option>
                                        <option value={3}>3</option>
                                    </select>
                                    :<select value={year} className="year-select" onChange={(e)=>{setYear(e.target.value)}}>
                                        <option value={1}>1</option>
                                        <option value={2}>2</option>
                                        <option value={3}>3</option>
                                        <option value={4}>4</option>
                                        <option value={5}>5</option>
                                        <option value={6}>6</option>
                                        <option value={7}>7</option>
                                        <option value={8}>8</option>
                                    </select>
                                }
                            </div>

                            <button className="login-btn"
                                onClick={(e) => signup(e)}
                            >Sign Up</button>

                            <p className="sign-up-note">Have an account? <span onClick={swap}>sign in...</span></p>

                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
export default Login;