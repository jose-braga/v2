<template>
<v-card class="mb-4">
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Lab affiliation</h3>
        </div>
    </v-card-title>
    <v-card-text></v-card-text>
    <v-container class="px-6">
        <ul>
        <li v-for="(pos, j) in data.lab_data" :key="j">
            <span class="position-name">{{pos.lab_position_name_en}} </span> -
            <span class="lab-name">{{pos.name}} @ {{pos.group_string}}  @ </span>
            <span :class="pos.unit_string + ' unit'">{{pos.unit_string}}</span>
            <br>
            <span v-if="pos.integrated || pos.pluriannual || pos.nuclearCV"
                    class="unit-situation">
                <span v-if="pos.integrated">Integrated, </span>
                <span v-if="pos.pluriannual">Pluriannual, </span>
                <span v-if="pos.nuclearCV">Nuclear CV,</span>
                <br>
            </span>
            <span class="date-affiliation">
                Dedication: {{pos.dedication}}%
                ({{pos.valid_from}} - {{pos.valid_until}})
            </span>
        </li>
    </ul>
    </v-container>
</v-card>
</template>

<script>
import time from '../common/date-utils'

export default {
    props: {
        personId: Number,
        token: String,
    },
    data() {
        return {
            data: {
                lab_data: [],
            }
        }
    },
    created() {
        this.getPersonLabs();

    },
    methods: {
        addValue () {
            this.$store.commit('addPersonData', this.data);
        },
        getPersonLabs() {
            const urlSubmit = 'api/pre-register/people/' + this.personId + '/labs';
            this.$http.get(urlSubmit, {
                headers: {'Authorization': 'Bearer ' + this.token},
            })
            .then((result) => {
                for (let el in result.data.result) {
                    this.data.lab_data.push({});
                    Object.keys(result.data.result[el]).forEach(key => {
                        let value = result.data.result[el][key];
                        if (key === 'valid_from' || key === 'valid_until') {
                            value = time.momentToDate(value);
                        }
                        this.data.lab_data[el][key] = value;
                    });
                    this.data.lab_data[el].group_string = this.data.lab_data[el].groups[0].name;
                    if (this.data.lab_data[el].groups.length > 1) {
                        for (let indGroup in this.data.lab_data[el].groups) {
                            if (indGroup > 1) {
                                this.data.lab_data[el].group_string =
                                    this.data.lab_data[el].group_string +
                                    ', ' + this.data.lab_data[el].groups[indGroup].name;
                            }
                        }
                    }
                    // considering that a group can only belong to a single unit in its history
                    this.data.lab_data[el].unit_string =
                                    this.data.lab_data[el].groups[0].units[0].short_name;
                }
                this.addValue();
            })
            .catch((error) => console.log(error))

        },
    }

}
</script>

<style scoped>

.position-name {
    font-weight:bold;
    color:#000000;
}

.lab-name {
    color:#777777;
}

.unit-situation {
    color:midnightblue;
    font-size: 0.8rem;
    font-weight: 500;
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