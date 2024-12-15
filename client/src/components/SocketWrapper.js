import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";

function addPropsToReactElement(element, props) {
    if (React.isValidElement(element)) {
        return React.cloneElement(element, props);
    }
    return element;
}

function addPropsToChildren(children, props) {
    if (!Array.isArray(children)) {
        return addPropsToReactElement(children, props);
    }
    return children.map(childElement =>
        addPropsToReactElement(childElement, props)
    );
}

export default function SocketWrapper({ children }) {
    const socket = useState(() => io("http://localhost:7001"))[0];
    const [isConnected, setIsConnected] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { roomId } = useParams();

    useEffect(() => {
        const handleConnect = () => {
            setIsConnected(true);
        };

        const handleDisconnect = () => {
            setIsConnected(false);
        };

        const kickStrangerOut = () => {
            navigate("/", { replace: true });
            toast.error("No username provided");
        };

        if (location.state && location.state.username) {
            socket.emit("when a user joins", { roomId, username: location.state.username });
        } else {
            kickStrangerOut();
        }

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("when a user joins");
        };
    }, [socket, location.state, roomId, navigate]);

    return location.state && location.state.username ? (
        <div>{addPropsToChildren(children, { socket })}</div>
    ) : (
        <div className="room">
            <h2>No username provided. Please use the form to join a room.</h2>
        </div>
    );
}
