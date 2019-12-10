import { ReduceStore } from 'flux/utils';
import assign from 'object-assign';
import Dispatcher from '../dispatcher/Dispatcher';
import CandidateStore from './CandidateStore';  // eslint-disable-line import/no-cycle
import MeasureStore from './MeasureStore';  // eslint-disable-line import/no-cycle
import { extractScoreFromNetworkFromPositionList } from '../utils/positionFunctions';  // eslint-disable-line import/no-cycle
import { mergeTwoObjectLists, stringContains } from '../utils/textFormat';
import SupportActions from '../actions/SupportActions';
import VoterStore from './VoterStore';  // eslint-disable-line import/no-cycle

class SupportStore extends ReduceStore {
  getInitialState () {
    return {
      weVoteIdSupportListForEachBallotItem: {}, // Dictionary with key: candidate or measure we_vote_id, value: list of orgs supporting this ballot item
      weVoteIdOpposeListForEachBallotItem: {}, // Dictionary with key: candidate or measure we_vote_id, value: list of orgs opposing this ballot item
      nameSupportListForEachBallotItem: {}, // Dictionary with key: candidate or measure we_vote_id, value: list of orgs supporting this ballot item
      nameOpposeListForEachBallotItem: {}, // Dictionary with key: candidate or measure we_vote_id, value: list of orgs opposing this ballot item
    };
  }

  resetState () {
    return this.getInitialState();
  }

  get (ballotItemWeVoteId) {
    if (!(this.voterSupportsList && this.voterOpposesList && this.supportCounts && this.opposeCounts)) {
      return undefined;
    }

    return {
      is_support: this.voterSupportsList[ballotItemWeVoteId] || false,
      is_oppose: this.voterOpposesList[ballotItemWeVoteId] || false,
      is_public_position: this.isForPublicList[ballotItemWeVoteId] || false, // Default to friends only
      voter_statement_text: this.statementList[ballotItemWeVoteId] || '',
      support_count: this.supportCounts[ballotItemWeVoteId] || 0,
      oppose_count: this.opposeCounts[ballotItemWeVoteId] || 0,
    };
  }

  getBallotItemStatSheet (ballotItemWeVoteId) {
    if (!(this.voterSupportsList && this.voterOpposesList)) { //  && this.supportCounts && this.opposeCounts
      // console.log('getBallotItemStatSheet undefined');
      return undefined;
    }
    const isCandidate = stringContains('cand', ballotItemWeVoteId);
    const isMeasure = stringContains('meas', ballotItemWeVoteId);
    let allCachedPositions = [];
    if (isCandidate) {
      allCachedPositions = CandidateStore.getAllCachedPositionsByCandidateWeVoteId(ballotItemWeVoteId);
    } else if (isMeasure) {
      allCachedPositions = MeasureStore.getAllCachedPositionsByMeasureWeVoteId(ballotItemWeVoteId);
    }
    const results = extractScoreFromNetworkFromPositionList(allCachedPositions);
    const { numberOfSupportPositionsForScore, numberOfOpposePositionsForScore, numberOfInfoOnlyPositionsForScore } = results;
    // console.log('getBallotItemStatSheet ballotItemWeVoteId:', ballotItemWeVoteId, ', this.voterSupportsList:', this.voterSupportsList);
    return {
      voterSupportsBallotItem: this.voterSupportsList[ballotItemWeVoteId] || false,
      voterOpposesBallotItem: this.voterOpposesList[ballotItemWeVoteId] || false,
      voterPositionIsPublic: this.isForPublicList[ballotItemWeVoteId] || false, // Default to friends only
      voterTextStatement: this.statementList[ballotItemWeVoteId] || '',
      numberOfSupportPositionsForScore: numberOfSupportPositionsForScore || 0,
      numberOfOpposePositionsForScore: numberOfOpposePositionsForScore || 0,
      numberOfInfoOnlyPositionsForScore: numberOfInfoOnlyPositionsForScore || 0,
    };
  }

  getIsOpposeByBallotItemWeVoteId (ballotItemWeVoteId) {
    if (!(this.voterOpposesList)) {
      return false;
    }

    return this.voterOpposesList[ballotItemWeVoteId] || false;
  }

  getIsSupportByBallotItemWeVoteId (ballotItemWeVoteId) {
    if (!(this.voterSupportsList)) {
      return false;
    }

    return this.voterSupportsList[ballotItemWeVoteId] || false;
  }

  get voterSupportsList () {
    return this.getState().voter_supports;
  }

  getVoterSupportsListLength () {
    if (this.getState().voter_supports) {
      return Object.keys(this.getState().voter_supports).length;
    }
    return 0;
  }

  get voterOpposesList () {
    return this.getState().voter_opposes;
  }

  getVoterOpposesListLength () {
    if (this.getState().voter_opposes) {
      return Object.keys(this.getState().voter_opposes).length;
    }
    return 0;
  }

  get isForPublicList () {
    return this.getState().is_public_position;
  }

  get statementList () {
    return this.getState().voter_statement_text;
  }

  get supportCounts () {
    return this.getState().support_counts;
  }

  get opposeCounts () {
    return this.getState().oppose_counts;
  }

  isSupportAlreadyInCache () {
    return this.getState().support_counts && Object.keys(this.getState().support_counts).length > 0;
  }

  listWithChangedCount (list, ballotItemWeVoteId, amount) { // eslint-disable-line
    return assign({}, list, { [ballotItemWeVoteId]: list[ballotItemWeVoteId] + amount });
  }

  statementListWithChanges (statement_list, ballotItemWeVoteId, new_voter_statement_text) { // eslint-disable-line
    return assign({}, statement_list, { [ballotItemWeVoteId]: new_voter_statement_text });
  }

  isForPublicListWithChanges (is_public_position_list, ballotItemWeVoteId, is_public_position) { // eslint-disable-line
    return assign({}, is_public_position_list, { [ballotItemWeVoteId]: is_public_position });
  }

  getWeVoteIdSupportListUnderThisBallotItem (ballotItemWeVoteId) {
    // What are the issues that have positions for this election under this ballot item?
    // console.log("getIssuesUnderThisBallotItem, ballotItemWeVoteId:", ballotItemWeVoteId);
    if (ballotItemWeVoteId && this.getState().weVoteIdSupportListForEachBallotItem) {
      return this.getState().weVoteIdSupportListForEachBallotItem[ballotItemWeVoteId] || [];
    } else {
      return [];
    }
  }

  getNameSupportListUnderThisBallotItem (ballotItemWeVoteId) {
    if (ballotItemWeVoteId && this.getState().nameSupportListForEachBallotItem) {
      return this.getState().nameSupportListForEachBallotItem[ballotItemWeVoteId] || [];
    } else {
      return [];
    }
  }

  getNameOpposeListUnderThisBallotItem (ballotItemWeVoteId) {
    if (ballotItemWeVoteId && this.getState().nameOpposeListForEachBallotItem) {
      return this.getState().nameOpposeListForEachBallotItem[ballotItemWeVoteId] || [];
    } else {
      return [];
    }
  }

  // Turn action into a dictionary/object format with we_vote_id as key for fast lookup
  parseListToHash (property, list) { // eslint-disable-line
    const hashMap = {};
    if (list !== undefined && property) {
      list.forEach((el) => {
        if (el.ballot_item_we_vote_id && el[property]) {
          hashMap[el.ballot_item_we_vote_id] = el[property];
        }
      });
    }
    return hashMap;
  }

  reduce (state, action) {
    // Exit if we don't have a successful response (since we expect certain variables in a successful response below)
    if (!action.res || !action.res.success) return state;
    const {
      weVoteIdSupportListForEachBallotItem, weVoteIdOpposeListForEachBallotItem, nameSupportListForEachBallotItem,
      nameOpposeListForEachBallotItem,
    } = state;

    let ballotItemWeVoteId = '';
    if (action.res.ballot_item_we_vote_id) {
      ballotItemWeVoteId = action.res.ballot_item_we_vote_id;
    }

    let positionCountsList;
    const newOpposeCounts = this.parseListToHash('oppose_count', action.res.position_counts_list);
    const newSupportCounts = this.parseListToHash('support_count', action.res.position_counts_list);
    const existingOpposeCounts = state.oppose_counts !== undefined ? state.oppose_counts : [];
    const existingSupportCounts = state.support_counts !== undefined ? state.support_counts : [];
    const newOneOpposeCount = this.parseListToHash('oppose_count', action.res.position_counts_list);
    const newOneSupportCount = this.parseListToHash('support_count', action.res.position_counts_list);
    const existingOpposeCounts2 = state.oppose_counts !== undefined ? state.oppose_counts : [];
    const existingSupportCounts2 = state.support_counts !== undefined ? state.support_counts : [];
    let voterOpposes = {};
    let voterSupports = {};

    switch (action.type) {
      case 'voterAddressRetrieve':
        // We should really avoid overly broad cascading API calls like this, they can cause problems
        SupportActions.voterAllPositionsRetrieve();
        SupportActions.positionsCountForAllBallotItems(VoterStore.electionId());
        return state;

      case 'voterAllPositionsRetrieve':
        // is_support is a property coming from 'position_list' in the incoming response
        // state.voter_supports is an updated hash with the contents of position list['is_support']
        return {
          ...state,
          voter_supports: this.parseListToHash('is_support', action.res.position_list),
          voter_opposes: this.parseListToHash('is_oppose', action.res.position_list),
          voter_statement_text: this.parseListToHash('statement_text', action.res.position_list),
          is_public_position: this.parseListToHash('is_public_position', action.res.position_list),
        };

      case 'positionsCountForAllBallotItems':
        if (action.res.position_counts_list) {
          positionCountsList = action.res.position_counts_list;
          if (positionCountsList.length) {
            positionCountsList.forEach((positionsCountBlock) => {
              weVoteIdSupportListForEachBallotItem[positionsCountBlock.ballot_item_we_vote_id] = positionsCountBlock.support_we_vote_id_list;
              weVoteIdOpposeListForEachBallotItem[positionsCountBlock.ballot_item_we_vote_id] = positionsCountBlock.oppose_we_vote_id_list;
              nameSupportListForEachBallotItem[positionsCountBlock.ballot_item_we_vote_id] = positionsCountBlock.support_name_list;
              nameOpposeListForEachBallotItem[positionsCountBlock.ballot_item_we_vote_id] = positionsCountBlock.oppose_name_list;
            });
          }
        }

        // Duplicate values in the second array will overwrite those in the first
        return {
          ...state,
          oppose_counts: mergeTwoObjectLists(existingOpposeCounts, newOpposeCounts),
          support_counts: mergeTwoObjectLists(existingSupportCounts, newSupportCounts),
          weVoteIdSupportListForEachBallotItem,
          weVoteIdOpposeListForEachBallotItem,
          nameSupportListForEachBallotItem,
          nameOpposeListForEachBallotItem,
        };

      case 'positionsCountForOneBallotItem':

        // Duplicate values in the second array will overwrite those in the first
        return {
          ...state,
          oppose_counts: mergeTwoObjectLists(existingOpposeCounts2, newOneOpposeCount),
          support_counts: mergeTwoObjectLists(existingSupportCounts2, newOneSupportCount),
        };

      case 'voterOpposingSave':
        SupportActions.positionsCountForAllBallotItems(VoterStore.electionId());
        ({ voter_supports: voterSupports } = state);
        if (voterSupports && voterSupports[ballotItemWeVoteId] !== undefined) {
          delete voterSupports[ballotItemWeVoteId];
        }
        return {
          ...state,
          voter_supports: voterSupports,
          voter_opposes: assign({}, state.voter_opposes, { [ballotItemWeVoteId]: true }),
          support_counts: state.voter_supports[ballotItemWeVoteId] ?
            this.listWithChangedCount(state.support_counts, ballotItemWeVoteId, -1) :
            state.support_counts,
          oppose_counts: this.listWithChangedCount(state.oppose_counts, ballotItemWeVoteId, 1),
        };

      case 'voterStopOpposingSave':
        SupportActions.positionsCountForAllBallotItems(VoterStore.electionId());
        ({ voter_opposes: voterOpposes } = state);
        if (voterOpposes && voterOpposes[ballotItemWeVoteId] !== undefined) {
          delete voterOpposes[ballotItemWeVoteId];
        }
        return {
          ...state,
          voter_opposes: voterOpposes,
          oppose_counts: this.listWithChangedCount(state.oppose_counts, ballotItemWeVoteId, -1),
        };

      case 'voterSupportingSave':
        SupportActions.positionsCountForAllBallotItems(VoterStore.electionId());
        ({ voter_opposes: voterOpposes } = state);
        if (voterOpposes && voterOpposes[ballotItemWeVoteId] !== undefined) {
          delete voterOpposes[ballotItemWeVoteId];
        }
        return {
          ...state,
          voter_supports: assign({}, state.voter_supports, { [ballotItemWeVoteId]: true }),
          voter_opposes: voterOpposes,
          support_counts: this.listWithChangedCount(state.support_counts, ballotItemWeVoteId, 1),
          oppose_counts: state.voter_opposes[ballotItemWeVoteId] ?
            this.listWithChangedCount(state.oppose_counts, ballotItemWeVoteId, -1) :
            state.oppose_counts,
        };

      case 'voterStopSupportingSave':
        SupportActions.positionsCountForAllBallotItems(VoterStore.electionId());
        ({ voter_supports: voterSupports } = state);
        if (voterSupports && voterSupports[ballotItemWeVoteId] !== undefined) {
          delete voterSupports[ballotItemWeVoteId];
        }
        return {
          ...state,
          voter_supports: voterSupports,
          support_counts: this.listWithChangedCount(state.support_counts, ballotItemWeVoteId, -1),
        };

      case 'voterPositionCommentSave':

        // Add the comment to the list in memory
        return {
          ...state,
          voter_statement_text: this.statementListWithChanges(state.voter_statement_text, ballotItemWeVoteId, action.res.statement_text),
        };

      case 'voterPositionVisibilitySave':

        // Add the visibility to the list in memory
        return {
          ...state,
          is_public_position: this.isForPublicListWithChanges(state.is_public_position, ballotItemWeVoteId, action.res.is_public_position),
        };

      case 'voterSignOut':

        // console.log("resetting SupportStore");
        return this.resetState();

      default:
        return state;
    }
  }
}

export default new SupportStore(Dispatcher);
