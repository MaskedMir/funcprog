const filterEvenNumbers = (arr) => arr.filter(num => num % 2 === 0);


const squareNumbers = (arr) => arr.map(num => num ** 2);


const filterByProperty = (arr, property) => arr.filter(obj => obj.hasOwnProperty(property));


const sumArray = (arr) => arr.reduce((sum, num) => sum + num, 0);


const applyFunctionToArray = (arr, func) => arr.map(func);


const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];


const evenNumbers = filterEvenNumbers(numbers);
const squaredEvenNumbers = squareNumbers(evenNumbers);
const sumOfSquares = sumArray(squaredEvenNumbers);
console.log('Сумма квадратов четных чисел:', sumOfSquares);


const objects = [
    { name: 'Alice', age: 25 },
    { name: 'Bob', age: 30 },
    { name: 'Charlie', age: 35 },
    { name: 'David' }
];


const threshold = 28;
const filteredAges = objects
    .filter(obj => obj.age > threshold)
    .map(obj => obj.age);
const averageAge = filteredAges.length > 0 ? sumArray(filteredAges) / filteredAges.length : 0;
console.log('Средний возраст (больше', threshold, '):', averageAge);
