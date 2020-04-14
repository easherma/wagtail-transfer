import { createAction } from '../../lib/utils/actions';

function getHeaders() {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');

  // Need this header in order for Wagtail to recognise the request as AJAX.
  // This causes it to return 403 responses for authentication errors (rather than redirecting)
  headers.append('X-Requested-With', 'XMLHttpRequest');

  return {
    credentials: 'same-origin',
    headers: headers,
    method: 'GET'
  };
}

function get(url) {
  return fetch(url, getHeaders()).then(response => {
    switch (response.status) {
      case 200:
        return response.json();
      case 400:
        return response
          .json()
          .then(json => Promise.reject(`API Error: ${json.message}`));
      case 403:
        return Promise.reject(
          "You haven't got permission to view this. Please log in again."
        );
      case 500:
        return Promise.reject('Internal server error');
      default:
        return Promise.reject(
          `Unrecognised status code: ${response.statusText} (${response.status})`
        );
    }
  });
}

export const setApi = createAction('SET_API', api => ({ api }));

export const setView = createAction('SET_VIEW', (viewName, viewOptions) => ({
  viewName,
  viewOptions
}));

export const fetchPagesStart = createAction('FETCH_START');
export const fetchPagesSuccess = createAction(
  'FETCH_SUCCESS',
  (itemsJson, parentJson) => ({ itemsJson, parentJson })
);
export const fetchPagesFailure = createAction('FETCH_FAILURE', message => ({
  message
}));

export function browse(parentPageID, pageNumber) {
  // HACK: Assuming page 1 is the root page
  // eslint-disable-next-line no-param-reassign
  if (parentPageID === 1) {
    parentPageID = 'root';
  }

  return (dispatch, getState) => {
    dispatch(fetchPagesStart());

    const { api } = getState();
    const query = api.query({
      child_of: parentPageID,
      fields: 'parent,children'
    });
    query.setPageSize(20);

    // HACK: The admin API currently doesn't serve the root page
    if (parentPageID === 'root') {
      return query
        .getPage(pageNumber - 1)
        .then(pages => {
          dispatch(setView('browse', { parentPageID, pageNumber }));
          dispatch(fetchPagesSuccess(pages, null));
        })
        .catch(error => {
          dispatch(fetchPagesFailure(error.message));
        });
    }

    return Promise.all([
      query.getPage(pageNumber - 1),
      api.getPage(parentPageID, { fields: 'ancestors' })
    ])
      .then(([pages, parentPage]) => {
        dispatch(setView('browse', { parentPageID, pageNumber }));
        dispatch(fetchPagesSuccess(pages, parentPage));
      })
      .catch(error => {
        dispatch(fetchPagesFailure(error.message));
      });
  };
}

export function search(queryString, restrictPageTypes, pageNumber) {
  return (dispatch, getState) => {
    dispatch(fetchPagesStart());

    const { api } = getState();

    let queryParams = {
      fields: 'parent',
      search: queryString
    };
    if (restrictPageTypes) {
      queryParams['type'] = restrictPageTypes.join(',');
    }
    const query = api.query(queryParams);
    query.setPageSize(20);

    return query
      .getPage(pageNumber - 1)
      .then(pages => {
        dispatch(setView('search', { queryString, pageNumber }));
        dispatch(fetchPagesSuccess(pages, null));
      })
      .catch(error => {
        dispatch(fetchPagesFailure(error.message));
      });
  };
}


export const fetchModelsStart = createAction('FETCH_START');
export const fetchModelsSuccess = createAction(
  'FETCH_SUCCESS',
  (itemsJson, parentJson) => ({ itemsJson, parentJson })
);
export const fetchModelsFailure = createAction('FETCH_FAILURE', message => ({
  message
}));


export function browseModels(modelPath, pageNumber) {
  // TODO Remove pageNumber?
  // eslint-disable-next-line no-param-reassign
  if (modelPath === null) {
    modelPath = '';
  }

  return (dispatch, getState) => {
    dispatch(fetchModelsStart());


    const { api } = getState();

    const query = api.query();


    // HACK: The admin API currently doesn't serve the root page
    if (modelPath === '') {
      return query
        .getModel()
        .then(models => {

          dispatch(setView('browse', { modelPath, pageNumber }));
          dispatch(fetchModelsSuccess(models, null));
        })
        .catch(error => {
          dispatch(fetchModelsFailure(error.message));
        });
    }



    return Promise.all([
      query.getModel(modelPath),
    ])
      .then(([pages, parentPage]) => {
        dispatch(setView('browse', { modelPath, pageNumber }));
        dispatch(fetchPagesSuccess(pages, parentPage));
      })
      .catch(error => {
        dispatch(fetchPagesFailure(error.message));
      });
  };
}


export function searchModels(queryString, pageNumber) {
  return (dispatch, getState) => {
    dispatch(fetchModelsStart());

    const { api } = getState();

    const query = api.query({
      search: queryString
      // TODO: Add `models: label` to this for searching through a model.
    });

    return query
      .getModel()
      .then(pages => {
        dispatch(setView('search', { queryString, pageNumber }));
        dispatch(fetchModelsSuccess(pages, null));
      })
      .catch(error => {
        dispatch(fetchModelsFailure(error.message));
      });
  };
}

