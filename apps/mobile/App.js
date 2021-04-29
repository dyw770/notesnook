import http from 'notes-core/utils/http';
import React, {useEffect} from 'react';
import RNExitApp from 'react-native-exit-app';
import Orientation from 'react-native-orientation';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import SplashScreen from 'react-native-splash-screen';
import {AppRootEvents} from './AppRootEvents';
import {RootView} from './initializer.root';
import AppLoader from './src/components/AppLoader';
import {useTracked} from './src/provider';
import {Actions} from './src/provider/Actions';
import BiometricService from './src/services/BiometricService';
import {DDS} from './src/services/DeviceDetection';
import {
  eSendEvent,
  eSubscribeEvent,
  eUnSubscribeEvent,
} from './src/services/EventManager';
import SettingsService from './src/services/SettingsService';
import {db} from './src/utils/DB';
import {eDispatchAction, eOpenSideMenu} from './src/utils/Events';
import {MMKV} from './src/utils/mmkv';
import EditorRoot from './src/views/Editor/EditorRoot';

let initStatus = false;
const App = () => {
  const [, dispatch] = useTracked();

  useEffect(() => {
    (async () => {
      try {
        Orientation.getOrientation((e, r) => {
          DDS.checkSmallTab(r);
          dispatch({
            type: Actions.DEVICE_MODE,
            state: DDS.isLargeTablet()
              ? 'tablet'
              : DDS.isSmallTab
              ? 'smallTablet'
              : 'mobile',
          });
        });

        let func = async () => {
          eSendEvent(eOpenSideMenu);
          SplashScreen.hide();
          await db.init();
          console.log('db is ready');
          let requireIntro = await MMKV.getItem('introCompleted');
          loadDefaultNotes();
          console.log('loaded default note');
          if (!requireIntro) {
            await MMKV.setItem(
              'askForRating',
              JSON.stringify({
                timestamp: Date.now() + 86400000 * 2,
              }),
            );
          }
        };

        await SettingsService.init();
        if (
          SettingsService.get().appLockMode &&
          SettingsService.get().appLockMode !== 'none'
        ) {
          let result = await BiometricService.validateUser(
            'Unlock to access your notes',
            '',
          );
          if (result) {
            await func();
          } else {
            RNExitApp.exitApp();
            return;
          }
        } else {
          await func();
        }
      } catch (e) {
      } finally {
        initStatus = true;
        loadMainApp();
      }
    })();
  }, []);

  const _dispatch = data => {
    dispatch(data);
  };

  useEffect(() => {
    eSubscribeEvent(eDispatchAction, _dispatch);
    return () => {
      eUnSubscribeEvent(eDispatchAction, _dispatch);
    };
  }, []);

  const loadMainApp = () => {
    console.log('status on init', initStatus);
    if (initStatus) {
      SettingsService.setAppLoaded();
      eSendEvent('load_overlay');
      dispatch({type: Actions.ALL});
    }
  };

  async function loadDefaultNotes() {
    try {
      console.log('creating note');
      const isCreated = await MMKV.getItem('defaultNoteCreated');
      if (isCreated) return;
      const notes = await http.get(
        'https://app.notesnook.com/notes/index.json',
      );
      if (!notes) return;
      for (let note of notes) {
        console.log('getting content');
        const content = await http.get(note.mobileContent);
        await db.notes.add({
          title: note.title,
          headline: note.headline,
          localOnly: true,
          content: {type: 'tiny', data: content},
        });
      }
      console.log('default note created');
      await MMKV.setItem('defaultNoteCreated', 'yes');
      dispatch({type: Actions.ALL});
    } catch (e) {
      console.log(e, 'loading note on welcome');
    }
  }

  return (
    <SafeAreaProvider>
      <RootView />
      <EditorRoot />
      <AppRootEvents />
      <AppLoader onLoad={loadMainApp} />
    </SafeAreaProvider>
  );
};

export default App;
