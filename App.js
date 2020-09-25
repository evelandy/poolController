import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import Dashboard from './components/Dashboard';
import Forgot from './components/auth/Forgot';
import Login from './components/auth/Login'
import SignUp from './components/auth/SignUp';
import Home from './components/Home';
import ControlDisp from './components/controls/ControlDisp';

const RootStack = createStackNavigator({
  Home: {
    screen: Home
  },
  Login: {
    screen: Login
  },
  SignUp: {
    screen: SignUp
  },
  Forgot: {
    screen: Forgot
  },
  Dashboard: {
    screen: Dashboard
  },
  ControlDisp: {
    screen: ControlDisp
  },
  initialRouteName: 'Home',
});

const App = createAppContainer(RootStack);

export default App;
