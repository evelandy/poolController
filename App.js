import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import Dashboard from './components/Dashboard';
import Forgot from './components/auth/Forgot';
import Login from './components/auth/Login'
import SignUp from './components/auth/SignUp';
import Home from './components/Home';
import ControlDisp from './components/controls/ControlDisp';
import ManualPump from './components/controls/ManualPump';
import ManualCleaner from './components/controls/ManualCleaner';
import ManualLights from './components/controls/ManualLights';
import ManualAux1 from './components/controls/ManualAux1';
import Pump from './components/controls/schedule/Pump';


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
  ManualPump: {
    screen: ManualPump
  },
  ManualCleaner: {
    screen: ManualCleaner
  },
  ManualLights: {
    screen: ManualLights
  },
  ManualAux1: {
    screen: ManualAux1
  },
  Pump: {
    screen: Pump
  },
});

const App = createAppContainer(RootStack);

export default App;
