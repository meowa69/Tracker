export const getFilteredMenus = (role) => {
    const menus = [
        { title: "Dashboard", src: "src/assets/Images/dashboard.png", path: "/dashboard" },
        { title: "Add Record", src: "src/assets/Images/add.png", path: "/add-records" },
        { 
            title: "Manage Record", 
            src: "src/assets/Images/manage.png", 
            submenus: [
                { title: "Request", src: "src/assets/Images/request.png", path: "/request" },
                { title: "History", src: "src/assets/Images/history.png", path: "/history" },
            ]
        },
        { title: "Manage Committees", src: "src/assets/Images/management.png", path: "/committee-management" },
        { title: "Manage Account", src: "src/assets/Images/create.png", path: "/manage-account", isSeparated: true },
        { title: "Settings", src: "src/assets/Images/setting.png", path: "/settings" },
        { title: "Logout", src: "src/assets/Images/logout.png", path: "/login", isSeparated: true },
    ];

    // Filter menu based on role
    if (role !== "admin" && role !== "sub-admin") {
        return menus.filter(menu => 
            menu.title !== "Manage Record" && 
            menu.title !== "Manage Committees" && 
            menu.title !== "Manage Account"
            
        );
    }

    return menus;
};
