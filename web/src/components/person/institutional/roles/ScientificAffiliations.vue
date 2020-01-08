<template>
    <ul>
        <li v-for="(pos, j) in data.current_positions" :key="j">
            <span class="position-name">{{pos.lab_position_name_en}} </span> -
            <span class="lab-name">{{pos.lab_name}} @ {{pos.group_string}}  @ </span>
            <span :class="pos.unit_string + ' unit'">{{pos.unit_string}}</span>
            <br>
            <span class="date-affiliation">
                Dedication: {{pos.dedication}}%
                ({{pos.valid_from}} - {{pos.valid_until}})
            </span>
        </li>
    </ul>
</template>
<script>
import subUtil from '../../../common/submit-utils'
import time from '../../../common/date-utils'

export default {
    data () {
        return {
            data: {
                current_positions: [],
                past_positions: [],
            },
        }
    },
    created () {
        this.initialize();
    },
    methods: {
        initialize () {
             if (this.$store.state.session.loggedIn) {
                let personID = this.$store.state.session.personID;
                subUtil.getInfoPopulate(this, 'api/people/' + personID + '/lab-affiliations', true)
                .then( (result) => {
                    for (let el in result) {
                        this.data.current_positions.push({});
                        Object.keys(result[el]).forEach(key => {
                            let value = result[el][key];
                            if (key === 'valid_from' || key === 'valid_until') {
                                value = time.momentToDate(value);
                            }
                            this.data.current_positions[el][key] = value;
                        });
                        this.data.current_positions[el].group_string = this.data.current_positions[el].groups[0].name;
                        if (this.data.current_positions[el].groups.length > 1) {
                            for (let indGroup in this.data.current_positions[el].groups) {
                                if (indGroup > 1) {
                                    this.data.current_positions[el].group_string =
                                        this.data.current_positions[el].group_string +
                                        ', ' + this.data.current_positions[el].groups[indGroup].name;
                                }
                            }
                        }
                        // considering that a group can only belong to a single unit in its history
                        this.data.current_positions[el].unit_string =
                                        this.data.current_positions[el].groups[0].units[0].short_name;
                    }
                    this.data.current_positions = time.sorter(this.data.current_positions,'valid_from');
                })
            }
        },
    },
}
</script>

<style scoped>

li {
    margin-top: 20px;
}

.position-name {
    font-weight:bold;
    color:#000000;
}

.lab-name {
    color:#777777;
}

.date-affiliation {
    font-size: 0.8rem;
}

.UCIBIO {
    color: blue;
}

.LAQV {
    color: green;
}
.unit {
    font-weight: 300;
}

</style>