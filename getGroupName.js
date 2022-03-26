async function getGroupName(expression,stringToMatch,groups){
const regexExpression=`/${expression}/`
groups.array.forEach(group => {
    if (expression.match(regexExpression)){ return group} else return expression 
});

}