'use strict';

var __createBinding = this && this.__createBinding || (Object.create ? function (_0x231ee5, _0x3a769f, _0x1ec040, _0x3a2be8) {
  if (_0x3a2be8 === undefined) {
    _0x3a2be8 = _0x1ec040;
  }
  var _0x4f72cf = Object.getOwnPropertyDescriptor(_0x3a769f, _0x1ec040);
  if (!_0x4f72cf || ('get' in _0x4f72cf ? !_0x3a769f.__esModule : _0x4f72cf.writable || _0x4f72cf.configurable)) {
    _0x4f72cf = {
      'enumerable': true,
      'get': function () {
        return _0x3a769f[_0x1ec040];
      }
    };
  }
  Object.defineProperty(_0x231ee5, _0x3a2be8, _0x4f72cf);
} : function (_0x10e47a, _0x3a7b15, _0x19a85a, _0x2fa828) {
  if (_0x2fa828 === undefined) {
    _0x2fa828 = _0x19a85a;
  }
  _0x10e47a[_0x2fa828] = _0x3a7b15[_0x19a85a];
});
var __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function (_0x49832e, _0xf1d2ac) {
  Object.defineProperty(_0x49832e, "default", {
    'enumerable': true,
    'value': _0xf1d2ac
  });
} : function (_0xd5d2cc, _0x516774) {
  _0xd5d2cc["default"] = _0x516774;
});
var __importStar = this && this.__importStar || function (_0x510349) {
  if (_0x510349 && _0x510349.__esModule) {
    return _0x510349;
  }
  var _0xb95351 = {};
  if (_0x510349 != null) {
    for (var _0xf16f19 in _0x510349) if (_0xf16f19 !== "default" && Object.prototype.hasOwnProperty.call(_0x510349, _0xf16f19)) {
      __createBinding(_0xb95351, _0x510349, _0xf16f19);
    }
  }
  __setModuleDefault(_0xb95351, _0x510349);
  return _0xb95351;
};
var __importDefault = this && this.__importDefault || function (_0x400c02) {
  return _0x400c02 && _0x400c02.__esModule ? _0x400c02 : {
    'default': _0x400c02
  };
};
Object.defineProperty(exports, "__esModule", {
  'value': true
});
exports.initWASocket = exports.dataMessages = exports.removeWbot = exports.restartWbot = exports.getWbot = undefined;
const Sentry = __importStar(require("@sentry/node"));
const baileys_1 = __importStar(require("@whiskeysockets/baileys"));
const Whatsapp_1 = __importDefault(require('../models/Whatsapp'));
const logger_1 = require("../utils/logger");
const logger_2 = __importDefault(require("@whiskeysockets/baileys/lib/Utils/logger"));
const useMultiFileAuthState_1 = require('../helpers/useMultiFileAuthState');
const AppError_1 = __importDefault(require("../errors/AppError"));
const socket_1 = require("./socket");
const StartWhatsAppSession_1 = require('../services/WbotServices/StartWhatsAppSession');
const DeleteBaileysService_1 = __importDefault(require("../services/BaileysServices/DeleteBaileysService"));
const cache_1 = __importDefault(require("../libs/cache"));
const ImportWhatsAppMessageService_1 = __importDefault(require("../services/WhatsappService/ImportWhatsAppMessageService"));
const date_fns_1 = require("date-fns");
const moment_1 = __importDefault(require("moment"));
const wbotMessageListener_1 = require("../services/WbotServices/wbotMessageListener");
const addLogs_1 = require("../helpers/addLogs");
const node_cache_1 = __importDefault(require("node-cache"));
const loggerBaileys = logger_2['default'].child({});
loggerBaileys.level = "error";
const sessions = [];
const retriesQrCodeMap = new Map();
const getWbot = _0x23f74a => {
  const _0x390801 = sessions.findIndex(_0x16f23c => _0x16f23c.id === _0x23f74a);
  if (_0x390801 === -0x1) {
    throw new AppError_1["default"]("ERR_WAPP_NOT_INITIALIZED");
  }
  return sessions[_0x390801];
};
exports.getWbot = getWbot;
const restartWbot = async (_0x439f7d, _0x41606b) => {
  try {
    const _0x251906 = {
      'where': {
        'companyId': _0x439f7d
      },
      'attributes': ['id']
    };
    const _0x3b71a0 = await Whatsapp_1["default"].findAll(_0x251906);
    _0x3b71a0.map(async _0x314907 => {
      const _0xdc85cb = sessions.findIndex(_0x52a0a9 => _0x52a0a9.id === _0x314907.id);
      if (_0xdc85cb !== -0x1) {
        sessions[_0xdc85cb].ws.close();
      }
    });
  } catch (_0x254fa7) {
    logger_1.logger.error(_0x254fa7);
  }
};
exports.restartWbot = restartWbot;
const removeWbot = async (_0xffe68b, _0x33f380 = true) => {
  try {
    const _0x397ef7 = sessions.findIndex(_0x321007 => _0x321007.id === _0xffe68b);
    if (_0x397ef7 !== -0x1) {
      if (_0x33f380) {
        sessions[_0x397ef7].logout();
        sessions[_0x397ef7].ws.close();
      }
      sessions.splice(_0x397ef7, 0x1);
    }
  } catch (_0x1bd689) {
    logger_1.logger.error(_0x1bd689);
  }
};
exports.removeWbot = removeWbot;
exports.dataMessages = {};
const initWASocket = async _0x2c8d37 => {
  return new Promise(async (_0x56caba, _0x3d8842) => {
    try {
      (async () => {
        0x0;
        const _0xf95bd8 = socket_1.getIO();
        const _0x470779 = await Whatsapp_1["default"].findOne({
          'where': {
            'id': _0x2c8d37.id
          }
        });
        if (!_0x470779) {
          return;
        }
        const {
          id: _0x3a1d7a,
          name: _0xdfcc16,
          provider: _0x2cb243
        } = _0x470779;
        0x0;
        const {
          version: _0x3f14ed,
          isLatest: _0x488779
        } = await baileys_1.fetchLatestWaWebVersion({});
        logger_1.logger.info("using WA v" + _0x3f14ed.join('.') + ", isLatest: " + _0x488779);
        logger_1.logger.info("Starting session " + _0xdfcc16);
        let _0x290141 = 0x0;
        let _0x3d89cb = null;
        0x0;
        const {
          state: _0x1bae4c,
          saveCreds: _0x4ca35d
        } = await useMultiFileAuthState_1.useMultiFileAuthState(_0x2c8d37);
        const _0xc787cd = new node_cache_1['default']();
        0x0;
        _0x3d89cb = baileys_1["default"]({
          'version': _0x3f14ed,
          'logger': loggerBaileys,
          'printQRInTerminal': false,
          'auth': _0x1bae4c,
          'generateHighQualityLinkPreview': false,
          'shouldIgnoreJid': _0x1ed5a5 => (0x0, baileys_1.isJidBroadcast)(_0x1ed5a5),
          'browser': baileys_1.Browsers.appropriate("Desktop"),
          'defaultQueryTimeoutMs': 0x2710,
          'msgRetryCounterCache': _0xc787cd,
          'retryRequestDelayMs': 0xfa,
          'transactionOpts': {
            'maxCommitRetries': 0xa,
            'delayBetweenTriesMs': 0xbb8
          },
          'connectTimeoutMs': 0xea60,
          'getMessage': async () => undefined
        });
        setTimeout(async () => {
          const _0x30a1bf = await Whatsapp_1["default"].findByPk(_0x2c8d37.id);
          if (_0x30a1bf?.['importOldMessages'] && _0x30a1bf.status === "CONNECTED") {
            let _0x2456e9 = new Date(_0x30a1bf.importOldMessages).getTime();
            let _0x443d4f = new Date(_0x30a1bf.importRecentMessages).getTime();
            0x0;
            0x0;
            0x0;
            0x0;
            addLogs_1.addLogs({
              'fileName': "preparingImportMessagesWppId" + _0x2c8d37.id + '.txt',
              'forceNewFile': true,
              'text': "Aguardando conexão para iniciar a importação de mensagens:\n  Whatsapp nome: " + _0x30a1bf.name + "\n  Whatsapp Id: " + _0x30a1bf.id + "\n  Criação do arquivo de logs: " + moment_1["default"]().format("DD/MM/YYYY HH:mm:ss") + "\n  Selecionado Data de inicio de importação: " + moment_1['default'](_0x2456e9).format("DD/MM/YYYY HH:mm:ss") + " \n  Selecionado Data final da importação: " + moment_1['default'](_0x443d4f).format("DD/MM/YYYY HH:mm:ss") + " \n  "
            });
            const _0x493bef = new Date().getTime();
            await _0x30a1bf.update({
              'statusImportMessages': _0x493bef
            });
            _0x3d89cb.ev.on("messaging-history.set", async _0xa8e585 => {
              const _0x5e9827 = new Date().getTime();
              await _0x30a1bf.update({
                'statusImportMessages': _0x5e9827
              });
              const _0x1287a4 = _0x2c8d37.id;
              let _0x504980 = _0xa8e585.messages;
              let _0x39b934 = [];
              _0x504980.forEach(_0x494b8d => {
                const _0xff5340 = Math.floor(_0x494b8d.messageTimestamp.low * 0x3e8);
                0x0;
                if (wbotMessageListener_1.isValidMsg(_0x494b8d) && _0x2456e9 < _0xff5340 && _0x443d4f > _0xff5340) {
                  if (_0x494b8d.key?.["remoteJid"]['split']('@')[0x1] != "g.us") {
                    0x0;
                    0x0;
                    0x0;
                    addLogs_1.addLogs({
                      'fileName': "preparingImportMessagesWppId" + _0x2c8d37.id + ".txt",
                      'text': "Adicionando mensagem para pos processamento:\n  Não é Mensagem de GRUPO >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>\n  Data e hora da mensagem: " + moment_1['default'](_0xff5340).format("DD/MM/YYYY HH:mm:ss") + "\n  Contato da Mensagem : " + _0x494b8d.key?.['remoteJid'] + "\n  Tipo da mensagem : " + wbotMessageListener_1.getTypeMessage(_0x494b8d) + "\n  \n  "
                    });
                    _0x39b934.push(_0x494b8d);
                  } else if (_0x30a1bf?.["importOldMessagesGroups"]) {
                    0x0;
                    0x0;
                    0x0;
                    addLogs_1.addLogs({
                      'fileName': "preparingImportMessagesWppId" + _0x2c8d37.id + ".txt",
                      'text': "Adicionando mensagem para pos processamento:\n  Mensagem de GRUPO >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>\n  Data e hora da mensagem: " + moment_1["default"](_0xff5340).format("DD/MM/YYYY HH:mm:ss") + "\n  Contato da Mensagem : " + _0x494b8d.key?.['remoteJid'] + "\n  Tipo da mensagem : " + wbotMessageListener_1.getTypeMessage(_0x494b8d) + "\n  \n  "
                    });
                    _0x39b934.push(_0x494b8d);
                  }
                }
              });
              if (!exports.dataMessages?.[_0x1287a4]) {
                exports.dataMessages[_0x1287a4] = [];
                exports.dataMessages[_0x1287a4].unshift(..._0x39b934);
              } else {
                exports.dataMessages[_0x1287a4].unshift(..._0x39b934);
              }
              setTimeout(async () => {
                const _0x3af37f = await Whatsapp_1["default"].findByPk(_0x1287a4);
                _0xf95bd8.emit("importMessages-" + _0x3af37f.companyId, {
                  'action': "update",
                  'status': {
                    'this': -0x1,
                    'all': -0x1
                  }
                });
                _0xf95bd8.emit('whatsappSession', {
                  'action': "update",
                  'session': _0x3af37f
                });
              }, 0x1f4);
              setTimeout(async () => {
                const _0x3605de = await Whatsapp_1["default"].findByPk(_0x1287a4);
                if (_0x3605de?.["importOldMessages"]) {
                  let _0x28da42 = !isNaN(new Date(Math.floor(parseInt(_0x3605de?.["statusImportMessages"]))).getTime());
                  if (_0x28da42) {
                    const _0x579bc4 = new Date(Math.floor(parseInt(_0x3605de?.['statusImportMessages']))).getTime();
                    0x0;
                    const _0x25c340 = +date_fns_1.add(_0x579bc4, {
                      'seconds': 45
                    }).getTime();
                    if (_0x25c340 < new Date().getTime()) {
                      0x0;
                      ImportWhatsAppMessageService_1["default"](_0x3605de.id);
                      _0x3605de.update({
                        'statusImportMessages': "Running"
                      });
                    } else {}
                  }
                }
                _0xf95bd8.emit("whatsappSession", {
                  'action': "update",
                  'session': _0x3605de
                });
              }, 45000);
            });
          }
        }, 0x9c4);
        _0x3d89cb.ev.on("connection.update", async ({
          connection: _0x4744fa,
          lastDisconnect: _0x71298e,
          qr: _0x5ee1b5
        }) => {
          logger_1.logger.info("Socket  " + _0xdfcc16 + " Connection Update " + (_0x4744fa || '') + " " + (_0x71298e ? _0x71298e.error.message : ''));
          if (_0x4744fa === "close") {
            logger_1.logger.info("Socket  " + _0xdfcc16 + " Connection Update " + (_0x4744fa || '') + " " + (_0x71298e ? _0x71298e.error.message : ''));
            if (_0x71298e?.["error"]?.["output"]?.["statusCode"] === 0x193) {
              await _0x2c8d37.update({
                'status': "PENDING",
                'session': ''
              });
              0x0;
              await DeleteBaileysService_1["default"](_0x2c8d37.id);
              await cache_1["default"].delFromPattern("sessions:" + _0x2c8d37.id + ':*');
              _0xf95bd8.emit('company-' + _0x2c8d37.companyId + "-whatsappSession", {
                'action': "update",
                'session': _0x2c8d37
              });
              0x0;
              exports.removeWbot(_0x3a1d7a, false);
            }
            if (_0x71298e?.['error']?.["output"]?.["statusCode"] !== baileys_1.DisconnectReason.loggedOut) {
              0x0;
              exports.removeWbot(_0x3a1d7a, false);
              setTimeout(() => (0x0, StartWhatsAppSession_1.StartWhatsAppSession)(_0x2c8d37, _0x2c8d37.companyId), 0x7d0);
            } else {
              await _0x2c8d37.update({
                'status': "PENDING",
                'session': ''
              });
              0x0;
              await DeleteBaileysService_1["default"](_0x2c8d37.id);
              await cache_1["default"].delFromPattern('sessions:' + _0x2c8d37.id + ':*');
              _0xf95bd8.emit("company-" + _0x2c8d37.companyId + "-whatsappSession", {
                'action': "update",
                'session': _0x2c8d37
              });
              0x0;
              exports.removeWbot(_0x3a1d7a, false);
              setTimeout(() => (0x0, StartWhatsAppSession_1.StartWhatsAppSession)(_0x2c8d37, _0x2c8d37.companyId), 0x7d0);
            }
          }
          if (_0x4744fa === "open") {
            await _0x2c8d37.update({
              'status': "CONNECTED",
              'qrcode': '',
              'retries': 0x0,
              'number': _0x3d89cb.type === 'md' ? (0x0, baileys_1.jidNormalizedUser)(_0x3d89cb.user.id).split('@')[0x0] : '-'
            });
            _0xf95bd8.emit("company-" + _0x2c8d37.companyId + "-whatsappSession", {
              'action': 'update',
              'session': _0x2c8d37
            });
            const _0x55e040 = sessions.findIndex(_0x114712 => _0x114712.id === _0x2c8d37.id);
            if (_0x55e040 === -0x1) {
              _0x3d89cb.id = _0x2c8d37.id;
              sessions.push(_0x3d89cb);
            }
            _0x56caba(_0x3d89cb);
          }
          if (_0x5ee1b5 !== undefined) {
            if (retriesQrCodeMap.get(_0x3a1d7a) && retriesQrCodeMap.get(_0x3a1d7a) >= 0x3) {
              await _0x470779.update({
                'status': "DISCONNECTED",
                'qrcode': ''
              });
              0x0;
              await DeleteBaileysService_1["default"](_0x470779.id);
              await cache_1["default"].delFromPattern("sessions:" + _0x2c8d37.id + ':*');
              _0xf95bd8.emit('company-' + _0x2c8d37.companyId + "-whatsappSession", {
                'action': "update",
                'session': _0x470779
              });
              _0x3d89cb.ev.removeAllListeners("connection.update");
              _0x3d89cb.ws.close();
              _0x3d89cb = null;
              retriesQrCodeMap["delete"](_0x3a1d7a);
            } else {
              logger_1.logger.info("Session QRCode Generate " + _0xdfcc16);
              retriesQrCodeMap.set(_0x3a1d7a, _0x290141 += 0x1);
              await _0x2c8d37.update({
                'qrcode': _0x5ee1b5,
                'status': "qrcode",
                'retries': 0x0,
                'number': ''
              });
              const _0x552e32 = sessions.findIndex(_0x45f41b => _0x45f41b.id === _0x2c8d37.id);
              if (_0x552e32 === -0x1) {
                _0x3d89cb.id = _0x2c8d37.id;
                sessions.push(_0x3d89cb);
              }
              _0xf95bd8.emit('company-' + _0x2c8d37.companyId + "-whatsappSession", {
                'action': "update",
                'session': _0x2c8d37
              });
            }
          }
        });
        _0x3d89cb.ev.on("creds.update", _0x4ca35d);
      })();
    } catch (_0x33028e) {
      Sentry.captureException(_0x33028e);
      console.log(_0x33028e);
      _0x3d8842(_0x33028e);
    }
  });
};
exports.initWASocket = initWASocket;
