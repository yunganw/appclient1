import React, {useEffect, useState} from 'react';
import {Amplify, Auth, Hub} from 'aws-amplify';
import awsconfig from './aws-exports';

Amplify.configure(awsconfig);

const UnauthedUser = () => {
    return (
        <div>
            <h1>App Client1</h1>
            You have not signed in yet.<p/>
            <button onClick={() => Auth.federatedSignIn()}>
                Open Hosted UI
            </button>
        </div>
    );
};

const AuthedUser = (user) => {
  console.log ('user:', user);
    return (
        <div>
          <h1> Hi {user.user.username}</h1>
          You've signed in to AppClient1 <p/>
            <button onClick={() => Auth.signOut()}>
                Sign Out
            </button>
        </div>
    );
};

export default function App() {
    const [user, setUser] = useState(null);
    const [customState, setCustomState] = useState(null);

    useEffect(() => {
        const unsubscribe = Hub.listen('auth', ({payload: {event, data}}) => {
            switch (event) {
                case 'signIn':
                    setUser(data);
                    break;
                case 'signOut':
                    setUser(null);
                    break;
                case 'customOAuthState':
                    setCustomState(data);
                    break;
                default:
                    break;
            }
        });

        Auth.currentAuthenticatedUser()
            .then((currentUser) => setUser(currentUser))
            .catch(() => console.log('Not signed in'));

        return unsubscribe;
    }, []);

    return user ? <AuthedUser user={user}/> : <UnauthedUser />;
}
