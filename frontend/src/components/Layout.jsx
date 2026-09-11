import Sidebar from "./Sidebar";

function Layout({ children }) {
    return (
        <div className="crm-layout">

            <Sidebar />

            <main className="crm-main">
                {children}
            </main>

        </div>
    );
}

export default Layout;