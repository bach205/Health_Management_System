import Button from "../../components/ui/Button";

const Home = () => {
    return (
        <div className="bg-amber-300">
            <h1 >Home {import.meta.env.VITE_PORT} a</h1>
            <Button>Click me</Button>
        </div>
    );
};

export default Home; 