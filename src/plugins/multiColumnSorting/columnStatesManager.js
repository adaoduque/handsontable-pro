import {isObject, objectEach} from 'handsontable/helpers/object';
import {arrayMap} from 'handsontable/helpers/array';

const inheritedColumnProperties = ['sortEmptyCells', 'indicator', 'compareFunctionFactory'];

export const ASC_SORT_STATE = 'asc';
export const DESC_SORT_STATE = 'desc';

const SORT_EMPTY_CELLS_DEFAULT = false;
const SHOW_SORT_INDICATOR_DEFAULT = false;

/**
 * Get if column state is valid.
 *
 * @param {Number} columnState Particular column state.
 * @returns {Boolean}
 */
export function isValidColumnState(columnState) {
  const {column, sortOrder} = columnState;

  return Number.isInteger(column) && [ASC_SORT_STATE, DESC_SORT_STATE].includes(sortOrder);
}

/**
 * Get next sort order for particular column. The order sequence looks as follows: 'asc' -> 'desc' -> undefined -> 'asc'
 *
 * @param {String|undefined} sortOrder sort order (`asc` for ascending, `desc` for descending and undefined for not sorted).
 * @returns {String|undefined} Next sort order (`asc` for ascending, `desc` for descending and undefined for not sorted).
 */
export function getNextSortOrder(sortOrder) {
  if (sortOrder === DESC_SORT_STATE) {
    return void 0;

  } else if (sortOrder === ASC_SORT_STATE) {
    return DESC_SORT_STATE;
  }

  return ASC_SORT_STATE;
}

/**
 * Store and manages states of sorted columns.
 *
 * @class ColumnStatesManager
 * @plugin MultiColumnSorting
 */
export class ColumnStatesManager {
  constructor() {
    /**
     * Queue of sort states containing sorted columns and their orders (Array of objects containing `column` and `sortOrder` properties).
     *
     * @type {Array}
     */
    this.sortedColumnsStates = [];
    /**
     * Determine if we should sort empty cells.
     *
     * @type {Boolean}
     */
    this.sortEmptyCells = SORT_EMPTY_CELLS_DEFAULT;
    /**
     * Determine if indicator should be visible (for sorted columns).
     *
     * @type {Boolean}
     */
    this.indicator = SHOW_SORT_INDICATOR_DEFAULT;
    /**
     * Determine compare function factory. Method get as parameters `sortState` and `columnMetas` and return compare function.
     */
    this.compareFunctionFactory = void 0;
  }

  /**
   * Update column properties which affect the sorting result.
   *
   * **Note**: All column properties can be overwritten by [columns](https://docs.handsontable.com/pro/Options.html#columns) option.
   *
   * @param {Object} allSortSettings Column sorting plugin's configuration object.
   */
  updateAllColumnsProperties(allSortSettings) {
    if (!isObject(allSortSettings)) {
      return;
    }

    objectEach(allSortSettings, (newValue, propertyName) => {
      if (inheritedColumnProperties.includes(propertyName)) {
        this[propertyName] = newValue;
      }
    });
  }

  /**
   * Get all column properties which affect the sorting result.
   *
   * @returns {Object}
   */
  getAllColumnsProperties() {
    return {
      sortEmptyCells: this.sortEmptyCells,
      indicator: this.indicator,
      compareFunctionFactory: this.compareFunctionFactory
    };
  }

  /**
   * Get index of first sorted column.
   *
   * @returns {Number|undefined}
   */
  getFirstSortedColumn() {
    let firstSortedColumn;

    if (this.getNumberOfSortedColumns() > 0) {
      firstSortedColumn = this.sortedColumnsStates[0].column;
    }

    return firstSortedColumn;
  }

  /**
   * Get sort order of column.
   *
   * @param {Number} searchedColumn Physical column index.
   * @returns {String|undefined} sort order (`asc` for ascending, `desc` for descending and undefined for not sorted).
   */
  getSortOrderOfColumn(searchedColumn) {
    const searchedState = this.sortedColumnsStates.find(({column}) => searchedColumn === column);
    let sortOrder;

    if (isObject(searchedState)) {
      sortOrder = searchedState.sortOrder;
    }

    return sortOrder;
  }

  /**
   * Get list of sorted columns.
   *
   * @returns {Array}
   */
  getSortedColumns() {
    return arrayMap(this.sortedColumnsStates, ({column}) => column);
  }

  /**
   * Get order of particular column in the states queue.
   *
   * @param {Number} column Physical column index.
   * @returns {Number}
   */
  getIndexOfColumnInSortQueue(column) {
    return this.getSortedColumns().indexOf(column);
  }

  /**
   * Get number of sorted columns.
   *
   * @returns {Number}
   */
  getNumberOfSortedColumns() {
    return this.sortedColumnsStates.length;
  }

  /**
   * Get if list of sorted columns is empty.
   *
   * @returns {Boolean}
   */
  isListOfSortedColumnsEmpty() {
    return this.getNumberOfSortedColumns() === 0;
  }

  /**
   * Get if particular column is sorted.
   *
   * @param {Number} column Physical column index.
   * @returns {Boolean}
   */
  isColumnSorted(column) {
    return this.getSortedColumns().includes(column);
  }

  /**
   * Get states for all sorted columns.
   *
   * @returns {Array}
   */
  getSortStates() {
    return this.sortedColumnsStates;
  }

  /**
   * Get sort state for particular column. Object contains `column` and `sortOrder` properties.
   *
   * **Note**: Please keep in mind that returned objects expose **physical** column index under the `column` key.
   *
   * @param {Number} column Physical column index.
   * @returns {Object|undefined}
   */
  getColumnSortState(column) {
    if (this.isColumnSorted(column)) {
      return this.sortedColumnsStates[this.getIndexOfColumnInSortQueue(column)];
    }

    return void 0;
  }

  /**
   * Set full sort state.
   *
   * @param {Array} sortState
   */
  setSortState(sortState) {
    this.sortedColumnsStates = sortState;
  }

  /**
   * Destroy the state manager.
   */
  destroy() {
    this.sortedColumnsStates.length = 0;
    this.sortedColumnsStates = null;
  }
}
