import { useEffect, useState } from "react";
import axios from "axios";

export default function SearchBox() {
    const backenduri = import.meta.env.VITE_BACKENDURI;
    const [search, setSearch] = useState("");
    const [results, setResults] = useState([]);
    const token = localStorage.getItem("token");

    useEffect(() => {

        if (search.length < 2) return;

        const controller = new AbortController();

        const timer = setTimeout(async () => {

            try {

                const res = await axios.get(`${backenduri}/product-search?q=${search}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                    {
                        signal: controller.signal
                    }
                );
                console.log(res.data);

                setResults(res.data);

            } catch (err) {

                if (err.name !== "CanceledError") {
                    console.error(err);
                }

            }

        }, 300);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };

    }, [search]);

    return (
        <>
            <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <div
                style={
                    {
                        height:"80vh",
                        overflow:"scroll"
                    }
                }
            >
                {results.map(product => (

                    <div key={product._id}>
                        <img
                            src={product.image_url}
                            width={40}
                            alt={product.name}
                        />
                        <p>{product.name}</p>
                        <p>{product.brand}</p>
                        <p>{product.type}</p>
                        <p>{product.category}</p>
                        <p>{product.subcategory}</p>
                        <p>{product.weight}</p>
                        <p>{product.mrp}</p>
                    </div>

                ))}

            </div>
        </>
    );
}