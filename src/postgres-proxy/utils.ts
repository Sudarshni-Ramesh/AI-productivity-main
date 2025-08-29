import { useDBStore } from "../postgres-db/stores";


export const executeQuery = async (query: string) => {

    const result = useDBStore.getState().execute(query);
    console.log("executing statement result", result);
    return result;
};

export const getRecordsFromTable = async (table_name: string) => {

    const result = useDBStore.getState().execute("select * from " + table_name+";");
    console.log("executing statement result", result);
    return result;
};

export const getGraphsData = async () => {
    console.log("Getting graphs data");
    const query = `
        SELECT *
        FROM graphs where should_display = true;
    `;
    const result = await executeQuery(query);
    console.log("result", result);
    console.log("result.rows:", result[0].rows);
    if (result && result[0].rows) {
        console.log("Graphs data retrieved");
    }
    return result[0].rows;
};
