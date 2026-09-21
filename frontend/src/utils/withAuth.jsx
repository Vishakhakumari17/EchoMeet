import { useEffect } from "react";
import { useNavigate } from "react-router-dom"

const withAuth = (WrappedComponent ) => {
    const AuthComponent = (props) => {
        const router = useNavigate();

        useEffect(() => {
            if (!localStorage.getItem("token")) {
                router("/login");
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

        return <WrappedComponent {...props} />
    }

    return AuthComponent;
}

export default withAuth;