<?php

/**
 * @copyright Copyright &copy; Kartik Visweswaran, Krajee.com, 2014
 * @package yii2-grid
 * @version 2.2.0
 */

namespace kartik\grid;

use Yii;
use yii\helpers\Html;
use yii\helpers\ArrayHelper;
use yii\base\InvalidConfigException;
use yii\web\View;

/**
 * Extends the Yii's CheckboxColumn for the Grid widget [[\kartik\widgets\GridView]]
 * with various enhancements.
 *
 * CheckboxColumn displays a column of checkboxes in a grid view.
 *
 * @author Kartik Visweswaran <kartikv2@gmail.com>
 * @since 1.0
 */
class CheckboxColumn extends \yii\grid\CheckboxColumn
{
    use ColumnTrait;
    
    /**
     * @var boolean whether the column is hidden from display. This is different 
     * than the `visible` property, in the sense, that the column is rendered,
     * but hidden from display. This will allow you to still export the column
     * using the export function.
     */
    public $hidden;
    
    /**
     * @var boolean|array whether the column is hidden in export output. If set to boolean `true`, 
     * it will hide the column for all export formats. If set as an array, it will accept the 
     * list of GridView export `formats` and hide output only for them.
     */
    public $hiddenFromExport = true;
    
    /**
     * @var string the horizontal alignment of each column. Should be one of
     * 'left', 'right', or 'center'.
     */
    public $hAlign = GridView::ALIGN_CENTER;

    /**
     * @var string the vertical alignment of each column. Should be one of
     * 'top', 'middle', or 'bottom'.
     */
    public $vAlign = GridView::ALIGN_MIDDLE;

    /**
     * @var boolean whether to force no wrapping on all table cells in the column
     * @see http://www.w3schools.com/cssref/pr_text_white-space.asp
     */
    public $noWrap = false;

    /**
     * @var string the width of each column (matches the CSS width property).
     * @see http://www.w3schools.com/cssref/pr_dim_width.asp
     */
    public $width = '50px';

    /**
     * @var boolean highlight current row if checkbox is checked
     */
    public $rowHighlight = true;

    /**
     * @var string highlight CSS class to be applied for highlighting the row.
     * Defaults to 'info'.
     */
    public $rowSelectedClass = GridView::TYPE_INFO;
    
    /**
     * @var boolean|string whether the page summary is displayed above the footer for this column.
     * If this is set to a string, it will be displayed as is. If it is set to `false` the summary
     * will not be displayed.
     */
    public $pageSummary = false;

    /**
     * @var array HTML attributes for the page summary cell
     */
    public $pageSummaryOptions = [];

    /**
     * @var boolean whether to just hide the page summary display but still calculate
     * the summary based on `pageSummary` settings
     */
    public $hidePageSummary = false;

    /**
     * @var boolean whether to merge the header title row and the filter row
     * This will not render the filter for the column and can be used when `filter`
     * is set to `false`. Defaults to `false`. This is only applicable when `filterPosition`
     * for the grid is set to FILTER_POS_BODY.
     */
    public $mergeHeader = true;

    /**
     * Initializes the widget
     */
    public function init()
    {
        if ($this->rowHighlight) {
            Html::addCssClass($this->contentOptions, 'kv-row-select');
            Html::addCssClass($this->headerOptions, 'kv-all-select');
            $view = $this->grid->getView();
            $view->registerJs('selectRow("' . $this->grid->options['id'] . '", "' . $this->rowSelectedClass . '");');
        }
        $this->parseFormat();
        $this->parseVisibility();
        parent::init();
        $this->setPageRows();
    }

    /**
     * Initialize column for pjax refresh
     */
    protected function initPjax()
    {
        if ($this->grid->pjax && $this->rowHighlight) {
            $cont = 'jQuery("#' . $this->grid->pjaxSettings['options']['id'] . '")';
            $grid = $this->grid->options['id'];
            $view = $this->grid->getView();
            $view->registerJs("{$cont}.on('pjax:complete', function(){selectRow('{$grid}', '{$this->rowSelectedClass}');});");
        }
    }
    
    /**
     * Renders the data cell content
     */
    public function renderDataCellContent($model, $key, $index)
    {        
        $this->initPjax();
        return parent::renderDataCellContent($model, $key, $index);
    }

}