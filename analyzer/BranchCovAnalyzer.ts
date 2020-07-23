import { not } from '@angular/compiler/src/output/output_ast';

export { };

// TODO Adapt from decision coverage to branch coverage

// this module analyzes the branch coverage of the source code
// it is very similar to decisions coverage, but evaluates decisions and branches in a bit different way
exports.BranchCovAnalyzer = class BranchCovAnalyzer {

    cid_data: object;

    constructor(cid_data: object) {
        this.cid_data = cid_data;
    }

    start_parsing() {
        this.parse_if_branches();

        this.parse_switch_branches();
    }

    parse_if_branches() {
        // parses the if branches for evaluations for true and false
        this.cid_data['code_data']['if_branches'].forEach(if_branch => {
            let taken_branches = 0;
            let nottaken_branches = if_branch['branch_results'].length;

            for (let i = 0; i < if_branch['branch_results'].length; i++) {
                if ('executions' in if_branch['branch_results'][i] &&
                    if_branch['branch_results'][i]['evaluations_true'] > 0) {
                    // branch was taken
                    taken_branches++;
                    nottaken_branches--;
                } else if (if_branch['branch_results'][i]['evaluation_marker_id'] == -1 &&
                    'executions' in if_branch['branch_results'][i - 1] &&
                    if_branch['branch_results'][i - 1]['evaluations_false'] > 0) {
                    // alternative check for else branches
                    taken_branches++;
                    nottaken_branches--;
                }
            }

            this.add_branch_coverage_info(taken_branches, nottaken_branches, if_branch['function_id']);
        });
    }

    parse_switch_branches() {
        // parses the switch branches for coverage of cases
        this.cid_data['code_data']['switch_branches'].forEach(switch_branch => {
            let taken_branches = 0;
            let nottaken_branches = switch_branch['cases'].length;

            for (let i = 0; i < switch_branch['cases'].length; i++) {
                if ('executions' in switch_branch['cases'][i] && switch_branch['cases'][i]['executions'] > 0) {
                    taken_branches++;
                    nottaken_branches--;
                }
            }

            this.add_branch_coverage_info(taken_branches, nottaken_branches, switch_branch['function_id']);
        });
    }

    add_branch_coverage_info(taken_branches: number, nottaken_branches: number, function_id: number) {
        this.cid_data['code_data']['taken_branches'] =
            (this.cid_data['code_data']['taken_branches'] + taken_branches) || taken_branches;
        this.cid_data['code_data']['nottaken_branches'] =
            (this.cid_data['code_data']['nottaken_branches'] + nottaken_branches) || nottaken_branches;

        // add statistic to function
        this.cid_data['code_data']['functions'].forEach(functionData => {
            if (functionData['function_id'] == function_id) {
                functionData['taken_branches'] =
                    (functionData['taken_branches'] + taken_branches) || taken_branches;
                functionData['nottaken_branches'] =
                    (functionData['nottaken_branches'] + nottaken_branches) || nottaken_branches;
            }
        });
    }
}