import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import Home from './components/Home';

const RootStack = createStackNavigator({
  Home: {
    screen: Home
  },
});

const App = createAppContainer(RootStack);

export default App;
