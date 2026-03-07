import { initializeRouter } from './pages/router.ts';
import {wireAudioUnlockOnce} from "./services/AudioUnlocker.ts";

initializeRouter();
wireAudioUnlockOnce();
