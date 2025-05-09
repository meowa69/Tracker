import { createContext, useState, useEffect } from "react";

export const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
    const [open, setOpen] = useState(() => {
        const storedOpenState = localStorage.getItem("sidebarOpen");
        return storedOpenState ? JSON.parse(storedOpenState) : true;
    });

    useEffect(() => {
        localStorage.setItem("sidebarOpen", JSON.stringify(open));
    }, [open]);

    const toggleSidebar = () => {
        setOpen((prev) => !prev);
    };

    return (
        <SidebarContext.Provider value={{ open, toggleSidebar }}>
            {children}
        </SidebarContext.Provider>
    );
};