#!/usr/bin/env node
// dividend history
// http://www.nasdaq.com/symbol/full/dividend-history
// http://dividata.com/stock/FULL/dividend
// egrep -i 'cashamount|date_' on the nasdaq dividend-history page yields:
// <span id="quotes_content_left_dividendhistoryGrid_exdate_38">12/29/2010</span> </td><td>Cash</td><td>
// <span id="quotes_content_left_dividendhistoryGrid_CashAmount_38">0.225</span> </td><td>
// <span id="quotes_content_left_dividendhistoryGrid_DeclDate_38">11/5/2010</span> </td><td>
// <span id="quotes_content_left_dividendhistoryGrid_RecDate_38">12/31/2010</span> </td><td>
// <span id="quotes_content_left_dividendhistoryGrid_PayDate_38">1/14/2011</span> </td>
//
