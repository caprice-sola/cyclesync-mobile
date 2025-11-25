import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
//import { ellipse, square, triangle } from 'ionicons/icons';
import { calendarOutline, createOutline, statsChartOutline } from "ionicons/icons";
import Plan from './pages/Plan';
import Logs from './pages/Logs';
import Insights from './pages/Insights';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonTabs>
        {/* Routes: which path renders which page */}
        <IonRouterOutlet>
          <Route exact path="/Plan">
            <Plan />
          </Route>
          <Route exact path="/Logs">
            <Logs /> 
          </Route>
          <Route exact path="/Insights">
            <Insights />
          </Route>
          <Route exact path="/">
            <Redirect to="/Plan" /> {/* Default to Plan */}
          </Route>
        </IonRouterOutlet>

        {/* Tab bar: which button points to which path */}
        <IonTabBar slot="bottom">
          <IonTabButton tab="plan" href="/Plan">
            <IonIcon icon={calendarOutline} />
            <IonLabel>Plan</IonLabel>
          </IonTabButton>

          <IonTabButton tab="log" href="/Logs">
            <IonIcon icon={createOutline} />
            <IonLabel>Log</IonLabel>
          </IonTabButton>

          <IonTabButton tab="insights" href="/Insights">
            <IonIcon icon={statsChartOutline} />
            <IonLabel>Insights</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  </IonApp>
);

export default App;
