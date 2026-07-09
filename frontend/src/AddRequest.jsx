import "./AddRequest.css"
import { useState } from "react";
import axios from "axios"
import "@fortawesome/fontawesome-free/css/all.min.css";
import { useNavigate } from "react-router-dom";

export default function AddRequest() {
    const navigate=useNavigate();
    const [itemName, setItemName] = useState("");
    const [quantity, setQuantity] = useState();
    const [price, setPrice] = useState();
    const [itemDes, setItemDes] = useState("");
    const [items, setItems] = useState([]);
    const [editIndex, setEditIndex] = useState(0);
    const [edititemName, seteditItemName] = useState("");
    const [editquantity, seteditQuantity] = useState(1);
    const [editprice, seteditPrice] = useState(0);
    const [edititemDes, seteditItemDes] = useState("");
    const [showEdit, setShowEdit] = useState(false);
    const [showEditblur,setshowEditblur]=useState(false);
    const [showNote,setshowNote]=useState(false);
    const [NoteP,setNoteP]=useState("");
    const [totalcost,settotalcost]=useState(0);
    const userId=localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    const [description,setdescription]=useState("");
    const [showreqcon,setshowreqcon]=useState(false);
    const [address,setaddress]=useState("");
    const backenduri = import.meta.env.VITE_BACKENDURI;

    function addItem() {
        if (itemName.trim() === "" || itemDes.trim() === "") {
            alert("all fields are required");
            return;
        }
        if (quantity <= 0 || price <= 0) {
            alert("no negative or zero values are allowed");
            return;
        }
        const newitem = {
            itemName: itemName,
            quantity: quantity,
            price: price,
            description: itemDes
        }
        settotalcost(prev=>prev+quantity*price);
        setItems([...items, newitem]);
        setItemName("");
        setQuantity("");
        setPrice("");
        setItemDes("");
    }

    function edititems() {
        if (edititemName.trim() === "" || edititemDes === "" || editquantity === "" || editprice === "") {
            alert("all fields are required");
            return;
        }
        if (editquantity <= 0 || editprice <= 0) {
            alert("no negative or zero values are allowed");
            return;
        }
        const newitem = {
            itemName: edititemName,
            quantity: editquantity,
            price: editprice,
            description: edititemDes
        }

        setItems(prevItems => {
            const newItems = [...prevItems];
            newItems[editIndex] = newitem;
            return newItems;
        });
    }

    function postrequest(){
        if(items.length===0){
            alert("there are no items to post a request");
            return;
        }
        setshowreqcon(true);
        setshowEditblur(true);
    }

    function conformpostreq(){
        if(description.trim()===""){
            alert("overall description is important");
            return;
        }
        if(address.trim()===""){
            alert("address is must to deliver to your place");
            return;
        }
        axios.post(`${backenduri}/request`,{userId,description,address,totalAmount:totalcost,requested:items},{
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .then(res=>{
            console.log(res)
        })
        .catch(error => {
            alert(error.response.data.message);
        });
        setshowreqcon(false);
        setshowEditblur(false);
        navigate("/home");
    }

    return (
        <div className="addrequest-outer-div">
            <div className="addreq-top-div">
                <div className="title-name-div">
                    <p className="title-up-name">COLLEGE
                        <span className="title-down-name">CART</span>
                    </p>
                </div>
                <div className="addreq-top-right">
                    <button className="post-req-btn"
                        onClick={()=>{
                            postrequest();
                        }}
                    >Post Request</button>
                    <button className="cancel-req-btn"
                        onClick={()=>{
                            navigate("/home");
                        }}
                    >Cancel</button>
                </div>
            </div>
            <p
                style={
                    {
                        fontSize: "18px",
                        margin: "10px 5px",
                        color: "blue"
                    }
                }
            >Fill this fields to Add New Item</p>
            <div className="adding-item-div">
                <div className="adding-inputs-div">
                    <input placeholder="Item Name"
                        type="text"
                        value={itemName}
                        onChange={(e) => {
                            setItemName(e.target.value);
                        }}
                        className="item-name-in"
                    ></input>
                    <input placeholder="Quantity"
                        type="number"
                        value={quantity}
                        onChange={(e) => {
                            setQuantity(e.target.value);
                        }}
                        className="quantity-in"
                    ></input>
                    <input placeholder="Price"
                        type="number"
                        value={price}
                        onChange={(e) => {
                            setPrice(e.target.value);
                        }}
                        className="price-in"
                    ></input>
                    <button
                        onClick={() => {
                            addItem();
                        }}
                        className="add-item-btn"
                    >🖉Add Item</button>
                </div>
                <textarea placeholder="Description of Item"
                    value={itemDes}
                    onChange={(e) => {
                        setItemDes(e.target.value);
                    }}
                    className="item-des"
                ></textarea>
            </div>
            <div>
                <div className="items-top-ps">
                    <p
                    style={
                        {
                            fontSize: "20px",
                            margin: "10px 5px",
                            color: "blue",
                            textDecoration: "underline",
                            textDecorationColor: "#2b52e0ff",
                            textDecorationThickness: "2px",
                            textUnderlineOffset: "4px",
                        }
                    }
                >List of Items:</p>
                <p className="total-cost-p"><span>Total Cost :</span> ₹ {totalcost}</p>
                </div>
                {
                    items.map((item, index) => {
                        return (
                            <div key={index} className="list-items-div">
                                <div className="item-content-ps">
                                    <p className="item-name-p"><span>Item Name:</span>{item.itemName}</p>
                                    <p className="item-quantity-p"><span>Quantity:</span>{item.quantity}</p>
                                    <p className="item-price-p"><span>Price:</span>{item.price}</p>
                                    <p className="total-price-p"><span>Total:</span>{item.price * item.quantity}</p>
                                </div>
                                <p className="item-des-p"><span>Description:</span>{item.description}</p>
                                <div className="items-modify-btns-div">
                                    <button className="edit-item-btn"
                                        onClick={() => {
                                            setEditIndex(index);
                                            seteditItemName(items[index].itemName);
                                            seteditQuantity(items[index].quantity);
                                            seteditPrice(items[index].price);
                                            seteditItemDes(items[index].description);
                                            setShowEdit(true);
                                            setshowEditblur(true);
                                        }}
                                    ><i class="fa-solid fa-pen-to-square"></i></button>
                                    <button className="delete-item-btn"
                                        onClick={() => {
                                            setEditIndex(index);
                                            setNoteP(`Are you conform to delete the item named : ${items[index].itemName}`);
                                            setshowNote(true);
                                            setshowEditblur(true);
                                        }}
                                    ><i class="fa-solid fa-trash"></i></button>
                                </div>
                            </div>
                        );
                    })
                }
            </div>
            {/* Blur screen / overlay */}
            <div
                className={showEditblur ? "blurscreen show" : "blurscreen"}
            ></div>
            {/* pop up for edit */}
            <div className={showEdit ? "pop-up-edit-div show" : "pop-up-edit-div"}>
                <input value={edititemName} type="text"
                    onChange={(e) => {
                        seteditItemName(e.target.value);
                    }}
                ></input>
                <input value={editquantity} type="number"
                    onChange={(e) => {
                        seteditQuantity(e.target.value);
                    }}
                ></input>
                <input value={editprice} type="number"
                    onChange={(e) => {
                        seteditPrice(e.target.value);
                    }}
                ></input>
                <textarea value={edititemDes}
                    onChange={(e) => {
                        seteditItemDes(e.target.value);
                    }}
                ></textarea>
                <div className="edit-btns-div">
                    <button className="edit-save-btn" onClick={() => {
                    edititems();
                    setShowEdit(false);
                    setshowEditblur(false);
                }}>save</button>
                <button className="edit-cancel-btn" onClick={() => {
                    setShowEdit(false);
                    setshowEditblur(false);
                }}>cancel</button>
                </div>
            </div>
            {/* alert before doing delete or cancel or post request */}
            <div className={showNote?"pop-up-note show":"pop-up-note"}>
                <p>{NoteP}</p>
                <div className="pop-up-note-btns">
                    <button
                    className="edit-note-con-btn"
                    onClick={()=>{
                        setItems(prevItems => prevItems.filter((_, i) => i !== editIndex));
                        setshowNote(false);
                        setshowEditblur(false);
                    }}
                >conform</button>
                <button
                className="edit-note-cancel-btn"
                    onClick={()=>{
                        setshowNote(false);
                        setshowEditblur(false);
                    }}
                >cancel</button>
                </div>
            </div>
            {/*post request conformation note */}
            <div className={showreqcon?"post-req-note show":"post-req-note"}>
                <p>Enter the description for an overall idea and suggestions and conform to submit...</p>
                <textarea
                    placeholder="overall description"
                    value={description}
                    onChange={(e)=>{
                        setdescription(e.target.value);
                    }}
                ></textarea>
                <textarea
                    placeholder="Address"
                    value={address}
                    onChange={(e)=>{
                        setaddress(e.target.value);
                    }}
                ></textarea>
                <div className="post-req-note-btns">
                    <button
                    className="post-req-con-btn"
                    onClick={()=>{
                        conformpostreq();
                    }}
                >conform</button>
                <button
                className="post-req-cancel-btn"
                    onClick={()=>{
                        setdescription("");
                        setaddress("");
                        setshowreqcon(false);
                        setshowEditblur(false);
                    }}
                >cancel</button>
                </div>
            </div>
        </div>
    );
}