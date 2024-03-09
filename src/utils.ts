export const zip = (arrays: any[]) => {
    return arrays[0].map(function (_: any, i: string | number) {
        return arrays.map(function (array) {
            return array[i];
        });
    });
};
