import { Input } from "@/components/form/Input";

const Home = () => {
    return (
        <div className="m-4">
            <Input
                label="Test"
                placeholder="Test"
                isError={true}
                helper="This is an error"
            />
        </div>
    );
};

export default Home;
