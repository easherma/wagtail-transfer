import React from 'react';
import PropTypes from 'prop-types';

import PageChooserPagination from './PageChooserPagination';
import ModelChooserResult from './ModelChooserResult';

const propTypes = {
  displayChildNavigation: PropTypes.bool,
  items: PropTypes.array,
  onPageChosen: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired,
  // pageTypes: PropTypes.object,
  // parentPage: PropTypes.any,
  // pageNumber: PropTypes.number.isRequired,
  // totalPages: PropTypes.number.isRequired,
  // onChangePage: PropTypes.func.isRequired
};

const defaultProps = {
  displayChildNavigation: false,
  items: [],
  pageTypes: {},
  parentPage: null
};

class ModelChooserResultSet extends React.Component {
  pageIsNavigable(page) {
    return !('id' in page);
  }

  pageIsChoosable(page) {
    return true;
  }

  render() {
    const {
      items,
      onPageChosen,
      onNavigate,
      // pageTypes,
      parentPage,
      // pageNumber,
      // totalPages,
      // onChangePage
    } = this.props;

    const results = items.map((page, i) => {
      const onChoose = e => {

        // if('object_name' in page) {
        // } else {
        // }
        onPageChosen(page);
        e.preventDefault();
      };

      const handleNavigate = e => {
        onNavigate(page);
        e.preventDefault();
      };
      return (
        <ModelChooserResult
          key={i}
          page={page}
          isChoosable={true} // TODO: Remove this as every object and model will be choosable
          isNavigable={this.pageIsNavigable(page)}
          onChoose={onChoose}
          onNavigate={handleNavigate}
          modelType={parentPage || null}
        />
      );
    });

    // Parent page
    let parent = null;
    if (parentPage) {
      const onChoose = e => {
        onPageChosen(parentPage);
        e.preventDefault();
      };

      const handleNavigate = e => {
        onNavigate(parentPage);
        e.preventDefault();
      };
      parent = (
        <ModelChooserResult
          page={parentPage}
          isParent={true}
          isChoosable={true} // TODO: Remove this as every object and model will be choosable
          isNavigable={this.pageIsNavigable(page)}
          onChoose={onChoose}
          onNavigate={handleNavigate}
          pageTypes={pageTypes}
        />
      );
    }

    return (
      <div className="page-results">
        <table className="listing  chooser">
          <colgroup>
            <col />
            <col width="10%" />
          </colgroup>
          <thead>
            <tr className="table-headers">
              <th className="title">Model Name</th>
              <th />
            </tr>
            {parent}
          </thead>
          <tbody>{results}</tbody>
        </table>

        {/* TODO: Pagination?  */}
        {/* <PageChooserPagination
          pageNumber={pageNumber}
          totalPages={totalPages}
          onChangePage={onChangePage}
        /> */}
      </div>
    );
  }
}

ModelChooserResultSet.propTypes = propTypes;
ModelChooserResultSet.defaultProps = defaultProps;

export default ModelChooserResultSet;