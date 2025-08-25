import { AppBar } from "./_components/AppBar";

const HomeLayout = async({ children }: { children: React.ReactNode }) => {
    return (
        <div className="h-screen w-full overflow-hidden">
            <AppBar />
            {children}
        </div>
    );
};

export default HomeLayout;
