import streamDeck from "@elgato/streamdeck";
import { MasterVolumeAction, MusicVolumeAction, SoundEffectVolumeAction } from "./volume-dial";

streamDeck.logger.setLevel("info");
streamDeck.actions.registerAction(new MasterVolumeAction());
streamDeck.actions.registerAction(new MusicVolumeAction());
streamDeck.actions.registerAction(new SoundEffectVolumeAction());
streamDeck.connect();
