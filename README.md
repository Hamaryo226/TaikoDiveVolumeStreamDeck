# TaikoDive Volume for Stream Deck +

Stream Deck + のダイヤルから TaikoDive のマスター・楽曲・SE音量を5%単位で調整します。タッチストリップには現在の音量をパーセント表示し、ダイヤルを押すと100%へ戻ります。

ゲームとプラグインは `127.0.0.1:24727` だけで通信します。TaikoDiveが起動していない間は表示が `--` になります。

## ビルド

```powershell
corepack pnpm install
corepack pnpm run build
```

ビルド後、`com.hama.taikodive-volume.sdPlugin` を Stream Deck CLI の `streamdeck link` でリンクするか、Stream Deck のプラグインフォルダーへ配置して Stream Deck を再起動します。

## 対応環境

- Windows 10以降
- Stream Deck 7.1以降
- Stream Deck +
- 音量制御サーバー対応版のTaikoDive
