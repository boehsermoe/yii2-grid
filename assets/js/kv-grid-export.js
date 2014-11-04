/*!
 * @copyright Copyright &copy; Kartik Visweswaran, Krajee.com, 2014
 * @version 2.2.0
 *
 * Grid Export Validation Module for Yii's Gridview. Supports export of
 * grid data as CSV, HTML, or Excel.
 *
 * Author: Kartik Visweswaran
 * Copyright: 2014, Kartik Visweswaran, Krajee.com
 * For more JQuery plugins visit http://plugins.krajee.com
 * For more Yii related demos visit http://demos.krajee.com
 */
function replaceAll(str, from, to) {
    return str.split(from).join(to);
}
(function ($) {

    var templates = {
        html: '<!DOCTYPE html>' +
            '<meta http-equiv="Content-Type" content="text/html;charset={encoding}"/>' +
            '<meta http-equiv="X-UA-Compatible" content="IE=edge;chrome=1"/>' +
            '{css}' +
            '<style>' +
            '.kv-wrap{padding:20px;}' +
            '.kv-align-center{text-align:center;}' +
            '.kv-align-left{text-align:left;}' +
            '.kv-align-right{text-align:right;}' +
            '.kv-align-top{vertical-align:top!important;}' +
            '.kv-align-bottom{vertical-align:bottom!important;}' +
            '.kv-align-middle{vertical-align:middle!important;}' +
            '.kv-page-summary{border-top:4px double #ddd;font-weight: bold;}' +
            '.kv-table-footer{border-top:4px double #ddd;font-weight: bold;}' +
            '.kv-table-caption{font-size:1.5em;padding:8px;border:1px solid #ddd;border-bottom:none;}' +
            '</style>' +
            '<body class="kv-wrap">' +
            '{data}' +
            '</body>',
        pdf: '{before}\n{data}\n{after}',
        excel: '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"' +
            'xmlns="http://www.w3.org/TR/REC-html40">' +
            '<head>' +
            '<meta http-equiv="Content-Type" content="text/html;charset={encoding}"/>' +
            '{css}' +
            '<!--[if gte mso 9]>' +
            '<xml>' +
            '<x:ExcelWorkbook>' +
            '<x:ExcelWorksheets>' +
            '<x:ExcelWorksheet>' +
            '<x:Name>{worksheet}</x:Name>' +
            '<x:WorksheetOptions>' +
            '<x:DisplayGridlines/>' +
            '</x:WorksheetOptions>' +
            '</x:ExcelWorksheet>' +
            '</x:ExcelWorksheets>' +
            '</x:ExcelWorkbook>' +
            '</xml>' +
            '<![endif]-->' +
            '</head>' +
            '<body>' +
            '{data}' +
            '</body>' +
            '</html>',
        popup: '<html style="display:table;width:100%;height:100%;">' +
            '<title>Grid Export - &copy; Krajee</title>' +
            '<body style="display:table-cell;font-family:Helvetica,Arial,sans-serif;color:#888;font-weight:bold;line-height:1.4em;text-align:center;vertical-align:middle;width:100%;height:100%;padding:0 10px;">' +
            '{msg}' +
            '</body>' +
            '</html>'
    };
            
    var isEmpty = function (value, trim) {
        return value === null || value === undefined || value == []
        || value === '' || trim && $.trim(value) === '';
    },
    popupDialog = function (url, name, w, h) {
      var left = (screen.width / 2) - (w / 2);
      var top = 60; //(screen.height / 2) - (h / 2);
      return window.open(url, name, 'toolbar=no, location=no, directories=no, status=yes, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);
    },
    slug = function (strText) {
        return strText.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'-');
    };
    
    var GridExport = function (element, options) {
        this.$element = $(element);
        this.$grid = options.grid;
        this.$table = this.$grid.find('table');
        this.$form = this.$grid.find('form.kv-export-form');
        this.encoding = this.$form.find('[name="export_encoding"]').val();
        this.filename = options.filename;
        this.showHeader = options.showHeader;
        this.columns = options.showHeader ? 'td,th' : 'td';
        this.alertMsg = options.alertMsg;
        this.messages = options.messages;
        this.exportConversions = options.exportConversions;
        this.config = options.config;
        this.popup = '';
        this.listen();
    };
    
    GridExport.prototype = {
        constructor: GridExport,
        getArray: function(expType) {
            var self = this, $table = self.clean(expType), head = [], data = {};
            if (self.config.colHeads != undefined && self.config.colHeads.length > 0) {
                head = self.config.colHeads;
            } else {
                $table.find('thead tr th').each(function(i, v){
                    var str = $(this).text(), slugStr = slug(str);
                    head[i] = (!self.config.slugColHeads || isEmpty(slugStr)) ? 'col_' + i : slugStr;
                });
            }
            $table.find('tbody tr:has("td")').each(function(i, v){
                data[i] = {};
                $(this).children('td').each(function(j, w){
                    var col = head[j];
                    data[i][col] = $(this).text();
                });
            });
            return data;
        },
        notify: function (e) {
            var self = this, msgs = self.messages;
            var msg1 = isEmpty(self.alertMsg) ? '' : self.alertMsg,
                msg2 = isEmpty(msgs.allowPopups) ? '' : msgs.allowPopups,
                msg3 = isEmpty(msgs.confirmDownload) ? '' : msgs.confirmDownload,
                msg = '';
            if (msg1.length && msg2.length) {
                msg = msg1 + '\n\n' + msg2;
            } else {
                if (!msg1.length && msg2.length) {
                    msg = msg2;
                } else {
                    msg = (msg1.length && !msg2.length) ? msg1 : ''
                }
            }
            if (msg3.length) {
                msg = msg + '\n\n' + msg3;
            }
            out = isEmpty(msg) ? false : confirm(msg);
            if (!out) {
                e.preventDefault();
            }
            return out;
        },
        setPopupAlert: function (msg) {
            var self = this;
            if (self.popup.document == undefined) {
                return;
            }
            if (arguments.length && arguments[1]) {
                var el =  self.popup.document.getElementsByTagName('body');
                setTimeout(function () {
                    el[0].innerHTML = msg;
                }, 4000);
            } else {
                var newmsg = templates.popup.replace('{msg}', msg);
                self.popup.document.write(newmsg);
            }
        },
        listenClick: function (callback) {
            var self = this, arg = arguments.length > 1 ? arguments[1] : '';
            self.$element.on("click", function (e) {
                if (!self.notify(e)) {
                    return;
                }
                if (!isEmpty(arg)) {
                    self[callback](arg);
                } else {
                    self[callback]();
                }
                e.preventDefault();
            });        
        },
        listen: function () {
            var self = this;
            self.$form.on('submit', function() {
                setTimeout(function () {
                    self.setPopupAlert(self.messages.downloadComplete, true);
                }, 1000);
            });
            if (self.$element.hasClass('export-csv')) {
                self.listenClick('exportTEXT', 'csv');
            }
            if (self.$element.hasClass('export-txt')) {
                self.listenClick('exportTEXT', 'txt');
            }
            if (self.$element.hasClass('export-html')) {
                self.listenClick('exportHTML');
            }
            if (self.$element.hasClass('export-xls')) {
                self.listenClick('exportEXCEL');
            }
            if (self.$element.hasClass('export-json')) {
                self.listenClick('exportJSON');
            }
            if (self.$element.hasClass('export-pdf')) {
                self.listenClick('exportPDF');
            }
        },
        clean: function (expType) {
            var self = this, $table = self.$table.clone();
            // Skip the filter rows and header rowspans
            $table.find('tr.filters').remove();
            $table.find('th').removeAttr('rowspan');
            if (!self.showHeader) {
                $table.find('thead').remove();
            }
            if (!self.showPageSummary) {
                $table.find('tfoot.kv-page-summary').remove();
            }
            if (!self.showFooter) {
                $table.find('tfoot.kv-table-footer').remove();
            }
            if (!self.showCaption) {
                $table.find('kv-table-caption').remove();
            }
            $table.find('.skip-export').remove();
            $table.find('.skip-export-' + expType).remove();
            var htmlContent = $table.html();
            htmlContent = self.preProcess(htmlContent);
            $table.html(htmlContent);
            return $table;
        },
        preProcess: function(content) {
            var self = this, conv = self.exportConversions, l = conv.length, processed = content;
            if (l > 0) {
                for (var i = 0; i < l; i++) {
                    processed = replaceAll(processed, conv[i]['from'], conv[i]['to']);
                }
            }
            return processed;
        },
        download: function (type, content) {
            var self = this, fmt = self.$element.data('format'), 
                config = isEmpty(self.config) ? {} : self.config;
            self.$form.find('[name="export_filetype"]').val(type);
            self.$form.find('[name="export_filename"]').val(self.filename);
            self.$form.find('[name="export_content"]').val(content);
            self.$form.find('[name="export_mime"]').val(fmt);
            if (type == 'pdf') {
                self.$form.find('[name="export_config"]').val(JSON.stringify(config));
            } else {    
                self.$form.find('[name="export_config"]').val('');
            }
            self.popup = popupDialog('', 'kvDownloadDialog', 350, 120);
            self.popup.focus();
            self.setPopupAlert(self.messages.downloadProgress);
            self.$form.submit();
            
        },
        exportHTML: function () {
            var self = this, $table = self.clean('html'), cfg = self.config,
                css = (self.config.cssFile && cfg.cssFile.length) ? '<link href="' + self.config.cssFile + '" rel="stylesheet">' : '',
                html = templates.html.replace('{encoding}', self.encoding).replace('{css}', css).replace('{data}', $('<div />').html($table).html());
            self.download('html', html);
        },
        exportPDF: function () {
            var self = this, $table = self.clean('pdf');
            var before = isEmpty(self.config.contentBefore) ? '' : self.config.contentBefore,
                after = isEmpty(self.config.contentAfter) ? '' : self.config.contentAfter,
                css = self.config.css,
                pdf = templates.pdf.replace('{css}', css)
                    .replace('{before}', before)
                    .replace('{after}', after)
                    .replace('{data}', $('<div />').html($table).html());
            self.download('pdf', pdf);
        },
        exportTEXT: function (expType) {
            var self = this, $table = self.clean(expType) ,
                $rows = $table.find('tr:has(' + self.columns + ')');
            // temporary delimiter characters unlikely to be typed by keyboard,
            // this is to avoid accidentally splitting the actual contents
            var tmpColDelim = String.fromCharCode(11), // vertical tab character
                tmpRowDelim = String.fromCharCode(0); // null character
            // actual delimiter characters for CSV format
            var colDelim = '"' + self.config.colDelimiter + '"', rowDelim = '"' + self.config.rowDelimiter + '"';
            // grab text from table into CSV formatted string
            var txt = '"' + $rows.map(function (i, row) {
                var $row = $(row), $cols = $row.find(self.columns);
                return $cols.map(function (j, col) {
                    var $col = $(col), text = $col.text();
                    return text.replace('"', '""'); // escape double quotes
                }).get().join(tmpColDelim);
            }).get().join(tmpRowDelim)
                .split(tmpRowDelim).join(rowDelim)
                .split(tmpColDelim).join(colDelim) + '"';
            self.download(expType, txt);
        },
        exportJSON: function () {
            var self = this, out = self.getArray('json'), 
                out = JSON.stringify(out, self.config.jsonReplacer, self.config.indentSpace);
            self.download('json', out);
        },
        exportEXCEL: function () {
            var self = this, $table = self.clean('xls'), cfg = self.config;
            $table.find('input').remove(); // remove any form inputs as they do not align well in excel
            var css = (cfg.cssFile && self.config.cssFile.length) ? '<link href="' + self.config.cssFile + '" rel="stylesheet">' : '';
            var xls = templates.excel.replace('{encoding}', self.encoding).replace('{css}', css).replace('{worksheet}', self.config.worksheet).replace('{data}', $('<div />').html($table).html()).replace(/"/g, '\'');
            self.download('xls', xls);
        },
    };

    //GridExport plugin definition
    $.fn.gridexport = function (option) {
        var args = Array.apply(null, arguments);
        args.shift();
        return this.each(function () {
            var $this = $(this),
                data = $this.data('gridexport'),
                options = typeof option === 'object' && option;

            if (!data) {
                $this.data('gridexport', (data = new GridExport(this, $.extend({}, $.fn.gridexport.defaults, options, $(this).data()))));
            }

            if (typeof option === 'string') {
                data[option].apply(data, args);
            }
        });
    };

    $.fn.gridexport.defaults = {
        filename: 'export',
        showHeader: true,
        showPageSummary: true,
        showFooter: true,
        showCaption: true,
        alertMsg: '',
        browserPopupsMsg: '',
        confirmMsg: '',
        messages: {
            allowPopups: '',
            confirmDownload: '',
            downloadProgress: '',
            downloadComplete: ''
        },
        config: {
            worksheet: '',
            colDelimiter: ',',
            rowDelimiter: '\r\n',
            cssFile: '',
            colHeads: [],
            slugColHeads: false,
            jsonReplacer: null,
            indentSpace: 4,
            pdfSettings: ''
        },
        exportConversions: {}
    };

})(window.jQuery);
