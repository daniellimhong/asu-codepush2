/**
 * Function to refresh arbitrary aspects of the mobile app.
 * Will be called on refresh drag wherever we need.
 *
 * Currently only works with flat queries
 *
 * @param {*} context
 * @param {*} refresh
 */
export const refreshAppTargets = async function(context, refresh) {
  const promiseArr = [];
  for (const k in refresh) {
    if (typeof refresh[k] !== "function") {
      switch (k) {
        case "queries":
          try {
            const queryPromises = iterateQueries(context, refresh[k]);
            promiseArr.concat(queryPromises);
          } catch (e) {
            console.log("Failed to iterate queries and refresh");
          }
          break;
        case "asyncStorage":
          console.log(refresh[k]);
          break;
        default:
          console.log(
            "Some value supplied that this isnt ready for. Oops!",
            k,
            refresh[k]
          );
          break;
      }
    }
  }

  return Promise.all(promiseArr);
};

/**
 * Iterate all provided queries, building out an array of promises
 * @param {*} context
 * @param {*} queryArray
 */
function iterateQueries(context, queryArray) {
  const promiseArray = [];
  queryArray.forEach(async query => {
    const prom = queryPromise(context, query);
    promiseArray.push(prom);
  });

  return promiseArray;
}

/**
 * Make a single promise object based on apollo queries
 *
 * @param {*} context
 * @param {*} query
 */
async function queryPromise(context, queryObject) {
  if (context.AppSyncClients.authClient) {
    const client = context.AppSyncClients.authClient;
    try {
      const obj = {
        query: queryObject.query,
        fetchPolicy: "network-only"
      };
      if (queryObject.variables) {
        const { variables } = queryObject;
        obj.variables = { ...variables };
      }

      const { data } = await client.query(obj);
      return data;
    } catch (e) {
      throw new Error(e);
    }
  }
}
