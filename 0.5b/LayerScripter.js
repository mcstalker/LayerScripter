// Github:   https://github.com/mcstalker/LayerScripter
// By:       Michael Stalker
// Contact:  https://app.roll20.net/users/1377180/michael-s

var HTMLScripter = HTMLScripter || (function () {
    'use strict';

    // my little html string builder
    this.build = function (tag, html, attrs) {
        // you can skip html param
        if (typeof (html) != 'string') {
            attrs = html;
            html = null;
        }
        var h = '<' + tag,
            attr;
        for (attr in attrs) {
            if (attrs[attr] === false) continue;
            h += ' ' + attr + ' = "' + attrs[attr] + '"';
        }
        return h += html ? ">" + html + "</" + tag + ">" : "/>";
    }

    this.CSSStyle = function (Styles) {
        //if (typeof (Styles) != 'object') {
        //    attrs = html;
        //    html = null;
        //}
        var Attrs = { 'style': '' },
            Style;

        for (Style in Styles) {
            if (Styles[Style] === false) continue;
            Attrs['style'] += ' ' + Style + ': ' + Styles[Style] + ';';
        }

        return Attrs;
    }
});

var LayerScripter = LayerScripter || (function () {
    'use strict';

    const
        SHOW_BUTTONS = '!layerscripter',
        ADD_BUTTON = '!layerscripter_add_button',
        BUTTON_DETAIL = '!layerscripter_button_detail',
        RENAME_BUTTON = '!layerscripter_rename_button',
        REMOVE_BUTTON = '!layerscripter_remove_button',
        ADD_ACTION = '!layerscripter_add_action',
        ACTION_DETAIL = '!layerscripter_action_detail',
        RENAME_ACTION = '!layerscripter_rename_action',
        REMOVE_ACTION = '!layerscripter_remove_action',
        CHANGE_DEST_LAYER = '!layerscripter_new_destination_layer',
        VALID_LAYERS = ['gmlayer', 'objects', 'map', 'walls'],
        Version = 0.2,
        Schema = 0.1,
        Style_CSS = {
            div_outer: {
                'background': '#fff',
                'border': 'solid 1px #000',
                'border-radius': '5px',
                'font-weight': 'bold',
                'margin-bottom': '1em',
                'overflow': 'hidden',
            },
            div_inner: {
                'background': '#000',
                'color': '#fff',
                'text-align': 'center',
            },
            div_left: {
                'text-align': 'left',
            },
            table: {
                'border': 'solid 1px #000',
                'width': '100%',
                'table-layout': 'fixed',
            },
            tr: {
                'border': 'solid 1px #000',
            },
            tr_top: {
                'border-top': 'solid 1px #000',
                'border-left': 'solid 1px #000',
                'border-right': 'solid 1px #000',
            },
            tr_top_gray: {
                'background': '#D6D6D6',
                'border-top': 'solid 1px #000',
                'border-left': 'solid 1px #000',
                'border-right': 'solid 1px #000',
            },
            tr_middle: {
                'border-left': 'solid 1px #000',
                'border-right': 'solid 1px #000',
            },
            tr_middle_gray: {
                'background': '#D6D6D6',
                'border-left': 'solid 1px #000',
                'border-right': 'solid 1px #000',
            },
            tr_bottom: {
                'border-bottom': 'solid 1px #000',
                'border-left': 'solid 1px #000',
                'border-right': 'solid 1px #000',
            },
            tr_bottom_gray: {
                'background': '#D6D6D6',
                'border-bottom': 'solid 1px #000',
                'border-left': 'solid 1px #000',
                'border-right': 'solid 1px #000',
            },
            td_action_text: {
                'font-size': '0.8em',
                'text-align': 'left',
                'padding-left': '12px',
            },
            td_action_detail_text: {
                'font-size': '0.8em',
                'text-align': 'left',
                'padding-left': '24px',
            },
            td_text: {
                'font-size': '0.8em',
                'text-align': 'left',
            },
            td_button: {
                'text-align': 'right',
                'width': '50px',
            },
            td_addaction: {
                'text-align': 'center',
                'width': '100%',
            },
            td_addbutton: {
                'text-align': 'left',
                'border-top': 'solid 1px #000',
                'width': '100%',
            },
            td_more_less_button: {
                'text-align': 'left',
                'width': '50px',
            },
            td_more_less_action: {
                'text-align': 'left',
                'width': '50px',
                'padding-left': '24px',
            },
            li: {
                'padding': '10px',
                'list-style-type': 'decimal',
            },
            a_addaction: {
                'font-size': '10px',
                'text-align': 'center',
                'width': '75px',
                'height': '13px',
                'margin': '-5px 0 0 0',
                'padding': '0 0 0 0',
                'border-radius': '10px',
                'border-color': '#000000',
                'white-space': 'nowrap',
                'background-color': '#028003',
            },
            a_addbutton: {
                'font-size': '10px',
                'text-align': 'center',
                'width': '100px',
                'height': '13px',
                'margin': '-5px 0 0 0',
                'padding': '0 0 0 0',
                'border-radius': '10px',
                'border-color': '#000000',
                'white-space': 'nowrap',
                'background-color': '#028003',
            },
            a_greembutton: {
                'font-size': '10px',
                'text-align': 'center',
                'width': '40px',
                'height': '13px',
                'margin': '-5px 0 0 0',
                'padding': '0 0 0 0',
                'border-radius': '10px',
                'border-color': '#000000',
                'white-space': 'nowrap',
                'background-color': '#028003',
            },
            a_redbutton: {
                'font-size': '10px',
                'text-align': 'center',
                'width': '40px',
                'height': '13px',
                'margin': '-5px 0 0 0',
                'padding': '0 0 0 0',
                'border-radius': '10px',
                'border-color': '#000000',
                'white-space': 'nowrap',
                'background-color': '#FF0000',
            },
        };

    var AddAction = function (ButtonId, Selected, NewLayer) {

        var i,
            Name,
            ActionId,
            CurrentLayer,
            ItemId,
            Type,
            Obj,
            ops;

        if (!IsButtonIdValid(ButtonId)) {
            SendChat('The action could not be created because the Button Id provided is not valid.');
            return (false);
        }
        if (!IsLayerValid(NewLayer)) {
            SendChat('The action could not be created because the layer provided is not valid.');
            return (false);
        }
        if ((typeof Selected !== 'undefined') && (Selected.length > 0)) {
            for (i in Selected) {
                if (!IsActionIdValid(ButtonId, ActionId)) {
                    ActionId = Selected[i]._id;
                    state.LayerScripter.Buttons[ButtonId].Actions[ActionId] = {};
                    state.LayerScripter.Buttons[ButtonId].Actions[ActionId].Type = Selected[i]._type;
                    state.LayerScripter.Buttons[ButtonId].Actions[ActionId].ShowDetail = false;
                    Obj = FindObj({ _id: ActionId, _type: state.LayerScripter.Buttons[ButtonId].Actions[ActionId].Type })[0];
                    if (Obj) {
                        log('Obj');
                        if ((state.LayerScripter.Buttons[ButtonId].Actions[ActionId].Type == 'graphic') && (Obj.get('name') != '')) {
                            state.LayerScripter.Buttons[ButtonId].Actions[ActionId].Name = Obj.get('name');
                            log('1');
                        }
                        else {
                            state.LayerScripter.Buttons[ButtonId].Actions[ActionId].Name = state.LayerScripter.Buttons[ButtonId].Actions[ActionId].Type;
                            log('3');
                        }
                        state.LayerScripter.Buttons[ButtonId].Actions[ActionId].CurrentLayer = Obj.get('layer');
                        state.LayerScripter.Buttons[ButtonId].Actions[ActionId].PageId = Obj.get('_pageid');
                        state.LayerScripter.Buttons[ButtonId].Actions[ActionId].NewLayer = NewLayer;
                    }
                }
                else {
                    SendChat(state.LayerScripter.Buttons[ButtonId].Actions[ActionId].Name + ' could not be added because it already exists.')
                }
            }
        }
        else {
            SendChat('No actions where created because no graphics where selected.');
        }
    };

    var AddButton = function (ButtonName, PlayerId) {

        var ButtonId;

        if (ButtonName == '') {
            SendChat('No button name found.  Please use a unique name.');
        }
        else if (IsButtonNameUnique(ButtonName)) {
            ButtonId = GetMacroButtonId(ButtonName);
            state.LayerScripter.Buttons[ButtonId] = {};
            state.LayerScripter.Buttons[ButtonId].Name = ButtonName;
            state.LayerScripter.Buttons[ButtonId].MacroId = GetOrCreateMacroButton(ButtonId, PlayerId);
            state.LayerScripter.Buttons[ButtonId].ShowActions = false;
            state.LayerScripter.Buttons[ButtonId].Actions = {};
        }
        else {
            SendChat('A button named ' + ButtonName + ' already exists.  Please use a unique name.');
        }
    };

    var ChatHandler = function (Roll20_msg) {

        var arg,
            args = Roll20_msg.content.split(/\s+--/),
            ActiveCharacters,
            ActionId,
            ActionName,
            ActionNewLayer,
            ButtonId,
            ButtonName,
            NewLayer,
            NewName;

        if ((Roll20_msg.type == "api") && (Roll20_msg.content.toLowerCase().indexOf(SHOW_BUTTONS) === 0)) {
            if (playerIsGM(Roll20_msg.playerid)) {


                if (args[0].toLowerCase().indexOf('!layerscripter') === 0) {
                    args = args.splice(1, args.length - 1);
                };

                if (args.length > 0) {
                    arg = args.shift().split(/\s+/);
                    switch (arg[0].toLowerCase()) {
                        case 'addaction':
                            ButtonId = arg.splice(1, 1)[0];
                            NewLayer = arg.splice(1, 1)[0];
                            AddAction(ButtonId, Roll20_msg.selected, NewLayer);
                            break;
                        case 'addbutton':
                            ButtonName = arg.splice(1, arg.length - 1).join('-');
                            AddButton(ButtonName, Roll20_msg.playerid);
                            break;
                        case 'changecurrentlayer':
                            ButtonId = arg.splice(1, 1)[0];
                            ActionId = arg.splice(1, 1)[0];
                            NewLayer = arg.splice(1, 1)[0];
                            ChangeCurrentLayer(ButtonId, ActionId, NewLayer);
                            break
                        case 'changenewlayer':
                            ButtonId = arg.splice(1, 1)[0];
                            ActionId = arg.splice(1, 1)[0];
                            NewLayer = arg.splice(1, 1)[0];
                            ChangeActionLayer(ButtonId, ActionId, NewLayer);
                            break
                        case 'executed':
                            ButtonId = arg.splice(1, 1)[0];
                            ExecutedButton(ButtonId);
                            break;
                        case 'executeaction':
                            ButtonId = arg.splice(1, 1)[0];
                            ActionId = arg.splice(1, 1)[0];
                            ExecuteAction(ButtonId, ActionId);
                            break;
                        case 'help':
                            ShowHelp();
                            break;
                        case 'listactions':
                            ButtonId = arg.splice(1, 1)[0];
                            ChangeShowAction(ButtonId);
                            break;
                        case 'listactionsdetail':
                            ButtonId = arg.splice(1, 1)[0];
                            ActionId = arg.splice(1, 1)[0];
                            ChangeShowActionDetail(ButtonId, ActionId);
                            break;
                        case 'removebutton':
                            ButtonId = arg.splice(1, 1)[0];
                            RemoveButton(ButtonId)
                            break;
                        case 'removeaction':
                            ButtonId = arg.splice(1, 1)[0];
                            ActionId = arg.splice(1, 1)[0];
                            RemoveAction(ButtonId, ActionId);
                            break;
                        case 'renameaction':
                            ButtonId = arg.splice(1, 1)[0];
                            ActionId = arg.splice(1, 1)[0];
                            NewName = arg.splice(1, arg.length - 1).join(' ');
                            RenameAction(ButtonId, ActionId, NewName);
                            break;
                        case 'renamebutton':
                            ButtonId = arg.splice(1, 1)[0];
                            NewName = arg.splice(1, arg.length - 1).join('-');
                            RenameButton(ButtonId, NewName);
                            break;
                        default:
                            ShowButtons();
                            break;
                    };
                };
                ShowMenu();
            };
        };
    };

    var ChangeActionLayer = function (ButtonId, ActionId, NewLayer) {
        if ((IsActionIdValid(ButtonId, ActionId)) && (IsLayerValid(NewLayer))) {
            state.LayerScripter.Buttons[ButtonId].Actions[ActionId].NewLayer = NewLayer;
        }
        else {
            SendChat('Could not change the objects new layer.  Please check that you have provided a valid Button Id, Action Id and Layer Name.')
        }
    }

    var ChangeCurrentLayer = function (ButtonId, ActionId, NewLayer) {
        if ((IsActionIdValid(ButtonId, ActionId)) && (IsLayerValid(NewLayer))) {
            if (ChangeLayer(ActionId, NewLayer)) {
                state.LayerScripter.Buttons[ButtonId].Actions[ActionId].CurrentLayer = NewLayer;
            }
            else {
                SendChat('There was an error when moving the object to the layer provided.')
            }
        }
        else {
            SendChat('Could not change the objects current layer.  Please check that you have provided a valid Button Id, Action Id and Layer Name.')
        }
    }

    var ChangeLayer = function (ActionId, NewLayer) {
        var Attr = { _id: ActionId },
        Obj = FindObj(Attr)[0];

        if (Obj) {
            Obj.set('layer', NewLayer);
            return (true);
        }

        return (false);
    };

    var ChangeShowAction = function (ButtonId) {
        if (IsButtonIdValid(ButtonId)) {
            state.LayerScripter.Buttons[ButtonId].ShowActions = !state.LayerScripter.Buttons[ButtonId].ShowActions;
            return (true);
        };
        return (false);
    };

    var ChangeShowActionDetail = function (ButtonId, ActionId) {
        if (IsActionIdValid(ButtonId, ActionId)) {
            state.LayerScripter.Buttons[ButtonId].Actions[ActionId].ShowDetail = !state.LayerScripter.Buttons[ButtonId].Actions[ActionId].ShowDetail;
            return (true);
        };
        return (false);
    };

    var CheckInstaller = function () {

        if (typeof state.LayerScripter === 'undefined') {
            state.LayerScripter = {};
            state.LayerScripter.Version = Version;
            UpdateSchema();
        }
        else if (state.LayerScripter.Version != Version) {
            state.LayerScripter.Version = Version;
        }
        if (state.LayerScripter.Schema != Schema) {
            UpdateSchema();
        }
        return;
    };

    var EventHandler = function () {
        on('chat:message', ChatHandler);
    };

    var ExecuteAction = function (ButtonId, ActionId) {

        var OldLayer;

        if (IsActionIdValid(ButtonId, ActionId)) {
            if (ChangeLayer(ActionId, state.LayerScripter.Buttons[ButtonId].Actions[ActionId].NewLayer)) {
                OldLayer = state.LayerScripter.Buttons[ButtonId].Actions[ActionId].NewLayer;
                state.LayerScripter.Buttons[ButtonId].Actions[ActionId].NewLayer = state.LayerScripter.Buttons[ButtonId].Actions[ActionId].CurrentLayer;
                state.LayerScripter.Buttons[ButtonId].Actions[ActionId].CurrentLayer = OldLayer;
                return (true);
            };
        }
        else {
            SendChat('Could not execute the action because the Button Id and/or Action Id was not valid.');
        };

        return (false);
    };

    var ExecutedButton = function (ButtonId) {

        var ActionId;

        if (IsButtonIdValid(ButtonId)) {
            for (ActionId in state.LayerScripter.Buttons[ButtonId].Actions) {
                ExecuteAction(ButtonId, ActionId);
            }
            return (true);
        }
        else {
            SendChat('Could not execute the action because the Button Id was not valid.');
        };
        return (false);
    };

    var FindButtonId = function (ButtonName) {

        var ButtonId;

        for (ButtonId in state.LayerScripter.Buttons) {
            if (state.LayerScripter.Buttons[ButtonId].Name === ButtonName) {
                return (ButtonId);
            }
        };
        return (false);
    };

    var FindMacroId = function (ButtonName) {
        var Obj = FindObj({ type: 'macro', name: ButtonName })[0];
        log(Obj.get(_id));
        if (Obj) {
            return (Obj.get(_id));
        }
        return (false);
    };

    var FindObj = function (attrs) {

        var Objs = findObjs(attrs)
        if ((Objs.length > 0)) {
            return (Objs);
        }
        return (false);
    };

    // GetButtonId checks if the given ButtoName is undefined or does not already have a button id assigned.  If that is the case a new id will be returned.  If the ButtonName 
    // already has a Id assigned the current Id will be returned.  Otherwise it return false.
    //  Input: string (ButtonName)
    //  Output: number

    var GetLayerQuestion = function () {
        return (' ?{New Layer|' + VALID_LAYERS.join('|') + '}');
    }

    var GetMacroButtonId = function (ButtonName) {

        if ((typeof ButtonName !== 'undefined') || (!FindMacroId(ButtonName))) {
            return (guid());
        }
        else if (FindMacroId(ButtonName)) {
            return (FindMacroId(ButtonName));
        }
        else {
            return (false);
        }
    };

    // IsButtonNameUnique compares the given ButtonName to existing button names.  If a match is found it return false otherwise it returns true.
    //  Input: string (ButtonName)
    //  Output: boolean

    var GetOrCreateMacroButton = function (ButtonId, PlayerId) {
        var Obj = FindObj({ _type: 'macro', name: state.LayerScripter.Buttons[ButtonId].Name })[0];
        if ((typeof Obj !== 'undefined') && (Obj.length > 0)) {
            return Obj.get('_id');
        }
        else {
            Obj = createObj('macro', {
                name: state.LayerScripter.Buttons[ButtonId].Name,
                action: '!LayerScripter --executed ' + ButtonId,
                playerid: PlayerId
            });
            return Obj.get('_id');
        }
    };

    var guid = function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    };

    var IsActionIdValid = function (ButtonId, ActionId) {
        if (IsButtonIdValid(ButtonId)
            && (typeof ActionId !== 'undefined')
            && (typeof ActionId === 'string')
            && (ActionId in state.LayerScripter.Buttons[ButtonId].Actions)) {
            return (true);
        }
        return (false);
    };

    var IsButtonIdValid = function (ButtonId) {
        if ((typeof ButtonId !== 'undefined')
            && (typeof ButtonId === 'string')
            && (ButtonId in state.LayerScripter.Buttons)) {
            return (true);
        }
        return (false);
    };

    var IsButtonNameUnique = function (ButtonName) {

        if (FindButtonId(ButtonName)) {
                return (false);
        };
        return (true);
    };

    var IsLayerValid = function (Layer) {
        if ((typeof Layer !== 'undefined')
            && (typeof Layer === 'string')
            && (VALID_LAYERS.indexOf(Layer) !== -1)) {
            return (true);
        }

        return (false);

    };

    var RemoveAction = function (ButtonId, ActionId) {
        if (ButtonId != null) {
            if (ActionId != null) {
                delete state.LayerScripter.Buttons[ButtonId].Actions[ActionId];
            };
        };
    };

    var RemoveButton = function (Arg) {

        var ButtonId = null,
            MarcoId = null;

        if (typeof Arg !== 'undefined') {
            if (Arg in state.LayerScripter.Buttons) {
                MarcoId = state.LayerScripter.Buttons[Arg].MacroId;
                ButtonId = Arg;
            }
            else if (FindButtonId(Arg)) {
                MarcoId = state.LayerScripter.Buttons[FindButtonId(Arg)].MacroId;
                ButtonId = FindButtonId(Arg);
            }
        }
        if (MarcoId != null) {
            RemoveMacroBotton(MarcoId)
        };
        if (ButtonId != null) {
            delete state.LayerScripter.Buttons[ButtonId];
        };

        return (false);
    };

    var RemoveMacroBotton = function (MarcoId) {

        var MacroButtonObj = FindObj({ _type: 'macro', _id: MarcoId })[0];
        if (typeof MacroButtonObj !== 'undefined') {
            MacroButtonObj.remove();
        }
        else {
        }
    };

    var RenameAction = function (ButtonId, ActionId, NewName) {

        log('RenameAction:ButtonId::' + ButtonId);
        log('RenameAction:ActionId::' + ActionId);
        log('RenameAction:NewName::' + NewName);

        state.LayerScripter.Buttons[ButtonId].Actions[ActionId].Name = NewName;
    }

    var RenameButton = function (ButtonId, ButtonName) {

        var MacroButtonObj = FindObj({ type: 'macro', _id: state.LayerScripter.Buttons[ButtonId].MacroId })[0];

        if (ButtonName == '') {
            SendChat('No button name found.  Please use a unique name.');
        }
        else if (IsButtonNameUnique(ButtonName)) {
            MacroButtonObj.set('name', ButtonName)
            state.LayerScripter.Buttons[ButtonId].Name = ButtonName;
        }
        else {
            SendChat(ButtonName + ' already exists.  Please use a unique name.');
        }

    }

    // This function send a message to the campaigns chat window from XP_tracker
    // Input: String = message to send
    // Output: None
    var SendChat = function (output_msg) {
        sendChat('LayerScripter', '/w gm ' + output_msg);
    }

    var ShowActions = function (ButtonId, ActionId) {
        var HTMLCode = new HTMLScripter,
            Action_Output = '',
            ShowActionDetailText = '';

        if (typeof state.LayerScripter.Buttons[ButtonId].Actions[ActionId].Name === 'string') {
            Action_Output += HTMLCode.build('td', state.LayerScripter.Buttons[ButtonId].Actions[ActionId].Name, HTMLCode.CSSStyle(Style_CSS.td_action_text));
        }
        Action_Output += HTMLCode.build('td', HTMLCode.build('a', 'Rename', Object.assign(HTMLCode.CSSStyle(Style_CSS.a_greembutton), { href: '!LayerScripter --RenameAction ' + ButtonId + ' ' + ActionId + ' ?{New Name}' })), HTMLCode.CSSStyle(Style_CSS.td_button));
        Action_Output += HTMLCode.build('td', HTMLCode.build('a', 'Remove', Object.assign(HTMLCode.CSSStyle(Style_CSS.a_redbutton), { href: '!LayerScripter --RemoveAction ' + ButtonId + ' ' + ActionId })), HTMLCode.CSSStyle(Style_CSS.td_button));

        return (Action_Output);
    }

    var ShowActionDetail = function (ButtonId, ActionId, TR_Middle_Style_CSS) {
        var Action_Detail_Output = '',
            HTMLCode = new HTMLScripter,
            Obj,
            PageName;


        state.LayerScripter.Buttons[ButtonId].Actions[ActionId].Type
        state.LayerScripter.Buttons[ButtonId].Actions[ActionId].CurrentLayer
        state.LayerScripter.Buttons[ButtonId].Actions[ActionId].NewLayer
        state.LayerScripter.Buttons[ButtonId].Actions[ActionId].PageId

        Action_Detail_Output += HTMLCode.build('tr', HTMLCode.build('td', 'Type: ' + state.LayerScripter.Buttons[ButtonId].Actions[ActionId].Type, Object.assign({ colspan: '2' }, HTMLCode.CSSStyle(Style_CSS.td_action_detail_text))) + HTMLCode.build('td', HTMLCode.build('a', 'Execute', Object.assign(HTMLCode.CSSStyle(Style_CSS.a_greembutton), { href: '!LayerScripter --ExecuteAction ' + ButtonId + ' ' + ActionId })), HTMLCode.CSSStyle(Style_CSS.td_button)), TR_Middle_Style_CSS);
        Action_Detail_Output += HTMLCode.build('tr', HTMLCode.build('td', 'Current Layer: ' + state.LayerScripter.Buttons[ButtonId].Actions[ActionId].CurrentLayer, Object.assign({ colspan: '2' }, HTMLCode.CSSStyle(Style_CSS.td_action_detail_text))) + HTMLCode.build('td', HTMLCode.build('a', 'Change', Object.assign(HTMLCode.CSSStyle(Style_CSS.a_greembutton), { href: '!LayerScripter --ChangeCurrentLayer ' + ButtonId + ' ' + ActionId + GetLayerQuestion() })), HTMLCode.CSSStyle(Style_CSS.td_button)), TR_Middle_Style_CSS);
        Action_Detail_Output += HTMLCode.build('tr', HTMLCode.build('td', 'New Layer: ' + state.LayerScripter.Buttons[ButtonId].Actions[ActionId].NewLayer, Object.assign({ colspan: '2' }, HTMLCode.CSSStyle(Style_CSS.td_action_detail_text))) + HTMLCode.build('td', HTMLCode.build('a', 'Change', Object.assign(HTMLCode.CSSStyle(Style_CSS.a_greembutton), { href: '!LayerScripter --ChangeNewLayer ' + ButtonId + ' ' + ActionId + GetLayerQuestion() })), HTMLCode.CSSStyle(Style_CSS.td_button)), TR_Middle_Style_CSS);

        if (FindObj({ _id: state.LayerScripter.Buttons[ButtonId].Actions[ActionId].PageId, _type: 'page' })) {

            Obj = FindObj({ _id: state.LayerScripter.Buttons[ButtonId].Actions[ActionId].PageId, _type: 'page' })[0];

            PageName = Obj.get('name')
            Action_Detail_Output += HTMLCode.build('tr', HTMLCode.build('td', 'Page: ' + PageName, Object.assign({ colspan: '3' }, HTMLCode.CSSStyle(Style_CSS.td_action_detail_text))), TR_Middle_Style_CSS);
        };
        //Action_Detail_Output += HTMLCode.build('td', HTMLCode.build('a', ShowActionDetailText, Object.assign(HTMLCode.CSSStyle(Style_CSS.a_greembutton), { href: '!LayerScripter --ListActionsDetail ' + ButtonId + ' ' + ActionId })), HTMLCode.CSSStyle(Style_CSS.td_button));

        return (Action_Detail_Output);
    }

    var ShowButtons = function () {
        var HTMLCode = new HTMLScripter,
            Output = '',
            ActionId,
            Button_Output = '',
            ButtonId,
            ShowActionButtonText = '',
            ShowActionDetailText = '',
            TR_Bottom_Style_CSS,
            TR_Middle_Style_CSS,
            TR_Top_Style_CSS,
            Odd_Row = true;

        for (ButtonId in state.LayerScripter.Buttons) {
            Button_Output = '';

            if (Odd_Row) {
                TR_Top_Style_CSS = HTMLCode.CSSStyle(Style_CSS.tr_top);
                TR_Middle_Style_CSS = HTMLCode.CSSStyle(Style_CSS.tr_middle);
                TR_Bottom_Style_CSS = HTMLCode.CSSStyle(Style_CSS.tr_bottom);
                Odd_Row = false;
            }
            else {
                TR_Top_Style_CSS = HTMLCode.CSSStyle(Style_CSS.tr_top_gray);
                TR_Middle_Style_CSS = HTMLCode.CSSStyle(Style_CSS.tr_middle_gray);
                TR_Bottom_Style_CSS = HTMLCode.CSSStyle(Style_CSS.tr_bottom_gray);
                Odd_Row = true;
            }

            if (typeof state.LayerScripter.Buttons[ButtonId].Name === 'string') {
                Button_Output += HTMLCode.build('td', state.LayerScripter.Buttons[ButtonId].Name, HTMLCode.CSSStyle(Style_CSS.td_text));
            }
            Button_Output += HTMLCode.build('td', HTMLCode.build('a', 'Rename', Object.assign(HTMLCode.CSSStyle(Style_CSS.a_greembutton), { href: '!LayerScripter --RenameButton ' + ButtonId + ' ?{New Name}' })), HTMLCode.CSSStyle(Style_CSS.td_button));
            Button_Output += HTMLCode.build('td', HTMLCode.build('a', 'Remove', Object.assign(HTMLCode.CSSStyle(Style_CSS.a_redbutton), { href: '!LayerScripter --RemoveButton ' + ButtonId })), HTMLCode.CSSStyle(Style_CSS.td_button));
            Output += HTMLCode.build('tr', Button_Output, TR_Top_Style_CSS);

            if (state.LayerScripter.Buttons[ButtonId].ShowActions) {
                for (ActionId in state.LayerScripter.Buttons[ButtonId].Actions) {
                    Output += HTMLCode.build('tr', ShowActions(ButtonId, ActionId), TR_Middle_Style_CSS);

                    if (state.LayerScripter.Buttons[ButtonId].Actions[ActionId].ShowDetail) {
                        Output += ShowActionDetail(ButtonId, ActionId, TR_Middle_Style_CSS);
                        ShowActionDetailText = 'Less';
                    }
                    else {
                        ShowActionDetailText = 'More';
                    };

                    Output += HTMLCode.build('tr', HTMLCode.build('td', HTMLCode.build('a', ShowActionDetailText, Object.assign(HTMLCode.CSSStyle(Style_CSS.a_greembutton), { href: '!LayerScripter --ListActionsDetail ' + ButtonId + ' ' + ActionId })), Object.assign(HTMLCode.CSSStyle(Style_CSS.td_more_less_action), { colspan: '3' })), TR_Middle_Style_CSS);

                }
                Output += HTMLCode.build('tr', HTMLCode.build('td', HTMLCode.build('a', 'Add Action', Object.assign(HTMLCode.CSSStyle(Style_CSS.a_addaction), { href: '!LayerScripter --AddAction ' + ButtonId + GetLayerQuestion() })), Object.assign(HTMLCode.CSSStyle(Style_CSS.td_addaction), { colspan: '3' })), TR_Middle_Style_CSS);
                ShowActionButtonText = 'Less';
            }
            else {
                ShowActionButtonText = 'More';
            };

            Button_Output = '';

            Button_Output += HTMLCode.build('td', HTMLCode.build('a', ShowActionButtonText, Object.assign(HTMLCode.CSSStyle(Style_CSS.a_greembutton), { href: '!LayerScripter --ListActions ' + ButtonId })), Object.assign(HTMLCode.CSSStyle(Style_CSS.td_more_less_button), { colspan: '3' }));

            Output += HTMLCode.build('tr', Button_Output, TR_Middle_Style_CSS);

        };

        if (Odd_Row) {
            Output += HTMLCode.build('tr', HTMLCode.build('td', HTMLCode.build('a', 'Add New Button', Object.assign(HTMLCode.CSSStyle(Style_CSS.a_addbutton), { href: '!LayerScripter --AddButton ?{Button Name}' })), Object.assign(HTMLCode.CSSStyle(Style_CSS.td_addbutton), { colspan: '3' })), HTMLCode.CSSStyle(Style_CSS.tr_bottom));
        }
        else {
            Output += HTMLCode.build('tr', HTMLCode.build('td', HTMLCode.build('a', 'Add New Button', Object.assign(HTMLCode.CSSStyle(Style_CSS.a_addbutton), { href: '!LayerScripter --AddButton ?{Button Name}' })), Object.assign(HTMLCode.CSSStyle(Style_CSS.td_addbutton), { colspan: '3' })), HTMLCode.CSSStyle(Style_CSS.tr_bottom_gray));
        }

        Output = HTMLCode.build('tbody', Output, {});
        Output = HTMLCode.build('table', Output, HTMLCode.CSSStyle(Style_CSS.table));
        Output = HTMLCode.build('div', Output, HTMLCode.CSSStyle(Style_CSS.div_left));

        return (Output);
    };

    var ShowMenu = function () {
        var HTMLCode = new HTMLScripter,
            output;

        output = HTMLCode.build('div', 'Layer Scripter Button List', HTMLCode.CSSStyle(Style_CSS.div_inner));
        output += ShowButtons();
        output = HTMLCode.build('div', output, HTMLCode.CSSStyle(Style_CSS.div_outer));
        SendChat(output);
    };

    var UpdateSchema = function () {

        switch (Schema) {
            case 0.1:
                state.LayerScripter.Configurations = {
                    CreateMacroButton: true,
                    AutoArchive: true,
                };

                state.LayerScripter.Buttons = {};
                break;
        };
        state.LayerScripter.Schema = Schema;
    };

    return {
        CheckInstalled: CheckInstaller,
        RegisterEventHandlers: EventHandler
    };

})();

on('ready', function () {
    'use strict';

    LayerScripter.CheckInstalled();
    LayerScripter.RegisterEventHandlers();
});



//var HTML = new HTMLScripter(),
//    attrs = HTML.CSSStyle(Style_CSS.a_greembutton),
//    string = HTML.build('div', 'This is a test message.', attrs);

//sendChat('Me', string);